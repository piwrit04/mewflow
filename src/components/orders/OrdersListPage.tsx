import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ClipboardList,
  Briefcase,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Sparkles,
  RotateCw,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Zap,
  CheckCircle2,
  CornerDownLeft,
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select, SelectOption } from '../ui/Select';
import { Tooltip } from '../ui/Tooltip';
import { Checkbox } from '../ui/Checkbox';
import { MewMascot } from '../brand/MewMascot';
import { OrderStatusBadge, TransferredBadge } from './OrderStatusBadge';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import {
  Order,
  OrderStatus,
  OrderType,
  PlatformType,
  ServerType,
  OrderFilterOptions,
} from '../../types';
import { orderRepository } from '../../repositories';
import {
  formatCurrency,
  formatNTEOrderNo,
  PLATFORM_LABELS,
  ORDER_STATUS_LABELS,
} from '../../services/settlementService';

const STATUS_OPTIONS: SelectOption<OrderStatus | 'all'>[] = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: ORDER_STATUS_LABELS.pending },
  { value: 'in_progress', label: ORDER_STATUS_LABELS.in_progress },
  { value: 'completed', label: ORDER_STATUS_LABELS.completed },
  { value: 'cancelled', label: ORDER_STATUS_LABELS.cancelled },
];

const TYPE_TABS: { id: OrderType; label: string; hint: string }[] = [
  { id: 'standard', label: '普通订单', hint: '日常代练 · 一单一结' },
  { id: 'hosting', label: '托管订单', hint: '长期托管 · 周期结算' },
];

const PLATFORM_OPTIONS: SelectOption<PlatformType | 'all'>[] = [
  { value: 'all', label: '全部平台' },
  { value: 'xianyu', label: '闲鱼' },
  { value: 'wechat', label: '微信' },
];

const SERVER_OPTIONS: SelectOption<ServerType | 'all'>[] = [
  { value: 'all', label: '全部服务器' },
  { value: 'official', label: '官服' },
  { value: 'bilibili', label: 'B服' },
  { value: 'international', label: '国际服' },
];

const PAGE_SIZE_OPTIONS: SelectOption<number>[] = [
  { value: 5, label: '5 条' },
  { value: 10, label: '10 条' },
  { value: 20, label: '20 条' },
  { value: 50, label: '50 条' },
];

interface OrdersListPageProps {
  initialStatusFilter?: OrderStatus | 'all';
  refreshKey?: number;
  onCreateNew: () => void;
  onEditOrder: (orderId: string) => void;
  onToast: (text: string) => void;
}

function formatShortDateTime(isoString: string | undefined): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${m}-${d} ${hh}:${mm}`;
  } catch {
    return isoString;
  }
}

const PlatformBadge: React.FC<{ platform: PlatformType }> = ({ platform }) => {
  if (platform === 'xianyu') {
    return (
      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#FFF9EA] text-[#D97706] border border-[#FFE8B3]">
        {PLATFORM_LABELS[platform]}
      </span>
    );
  }
  if (platform === 'wechat') {
    return (
      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#EAF7EE] text-[#2E8B57] border border-[#CCEED6]">
        {PLATFORM_LABELS[platform]}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F4E9E4]/60 text-[#8F8795] border border-[#F4E9E4]">
      {PLATFORM_LABELS[platform] || '其他'}
    </span>
  );
};

export const OrdersListPage: React.FC<OrdersListPageProps> = ({
  initialStatusFilter = 'all',
  refreshKey,
  onCreateNew,
  onEditOrder,
  onToast,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Type Tab & Filters State
  const [activeTypeTab, setActiveTypeTab] = useState<OrderType>('standard');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>(initialStatusFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | 'all'>('all');
  const [selectedServer, setSelectedServer] = useState<ServerType | 'all'>('all');

  // Batch Selection State
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);

  // Backup & Restore Dialog
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [jumpPageInput, setJumpPageInput] = useState('');

  // Copied indicator
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  // Deletion Dialog State
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync initialStatusFilter from props
  useEffect(() => {
    if (initialStatusFilter) {
      setSelectedStatus(initialStatusFilter);
      // 从工作台统计卡进入时，默认展示普通订单 TAB
      setActiveTypeTab('standard');
    }
  }, [initialStatusFilter]);

  // 弹窗（备份/还原、批量删除）支持 Escape 关闭
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (showBackupModal) setShowBackupModal(false);
      if (showBatchDeleteConfirm) setShowBatchDeleteConfirm(false);
    };
    if (showBackupModal || showBatchDeleteConfirm) {
      window.addEventListener('keydown', onKeyDown);
    }
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showBackupModal, showBatchDeleteConfirm]);

  // Load Orders
  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const filter: OrderFilterOptions = {
        searchTerm,
        status: selectedStatus,
        platform: selectedPlatform,
        server: selectedServer,
      };

      const result = await orderRepository.getAll(filter);
      setOrders(result);
      // Prune selected orders that no longer exist
      setSelectedOrderIds((prev) => prev.filter((id) => result.some((o) => o.id === id)));
    } catch {
      onToast('加载订单列表失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    setCurrentPage(1);
    setJumpPageInput('');
  }, [selectedStatus, searchTerm, selectedPlatform, selectedServer, refreshKey]);

  // Advance Order Status Handler (e.g. pending -> in_progress -> completed)
  const handleAdvanceStatus = async (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    if (order.status === 'completed' || order.status === 'cancelled') {
      return;
    }
    try {
      const updated = await orderRepository.advanceStatus(order.id);
      if (updated.status === 'completed') {
        onToast(`订单 ${formatNTEOrderNo(updated.orderNo)} 已推进为「已完成」`);
      } else if (updated.status === 'in_progress') {
        onToast(`订单 ${formatNTEOrderNo(updated.orderNo)} 已推进为「进行中」`);
      } else {
        onToast(`订单 ${formatNTEOrderNo(updated.orderNo)} 状态已更新`);
      }
      loadOrders();
    } catch (err: any) {
      onToast(err.message || '更新状态失败');
    }
  };

  // Copy helpers
  const handleCopyOrderNo = (e: React.MouseEvent, orderNo: string, id: string) => {
    e.stopPropagation();
    const formatted = formatNTEOrderNo(orderNo);
    navigator.clipboard.writeText(formatted).then(
      () => {
        setCopiedId(id);
        onToast(`已复制单号：${formatted}`);
        setTimeout(() => setCopiedId(null), 2000);
      },
      () => onToast('复制失败，请手动复制')
    );
  };

  const handleCopyPhone = (e: React.MouseEvent, phone: string | undefined, id: string) => {
    e.stopPropagation();
    if (!phone) return;
    navigator.clipboard.writeText(phone).then(
      () => {
        setCopiedPhoneId(id);
        onToast(`已复制手机号：${phone}`);
        setTimeout(() => setCopiedPhoneId(null), 2000);
      },
      () => onToast('复制失败，请手动复制')
    );
  };

  // Single Delete
  const handleConfirmDelete = async () => {
    if (!deletingOrder) return;
    setIsDeleting(true);
    try {
      const success = await orderRepository.delete(deletingOrder.id);
      if (success) {
        onToast(`订单 ${formatNTEOrderNo(deletingOrder.orderNo)} 已成功删除`);
        setDeletingOrder(null);
        loadOrders();
      } else {
        onToast('删除失败，未找到该订单');
      }
    } catch {
      onToast('删除订单时发生错误');
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedPlatform('all');
    setSelectedServer('all');
    setSelectedOrderIds([]);
  };

  // Switch between 普通订单 / 托管订单 tabs
  const handleTypeTabChange = (type: OrderType) => {
    if (type === activeTypeTab) return;
    setActiveTypeTab(type);
    setSelectedOrderIds([]);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    selectedStatus !== 'all' ||
    selectedPlatform !== 'all' ||
    selectedServer !== 'all';

  // Batch Selection Handlers
  // Derive per-type lists from the full (non-type-filtered) result, so the
  // two TAB tables (普通订单 / 托管订单) each get their own row set & count.
  const standardOrders = orders.filter((o) => o.type === 'standard');
  const hostingOrders = orders.filter((o) => o.type === 'hosting');
  const currentTypeOrders = activeTypeTab === 'hosting' ? hostingOrders : standardOrders;

  // Pagination calculation（safeCurrentPage 将 currentPage 钳制到有效范围，
  // 避免删掉最后一页数据后全选/渲染取到不同的切片）
  const totalOrders = currentTypeOrders.length;
  const totalPages = Math.ceil(totalOrders / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageOrders = currentTypeOrders.slice(startIndex, endIndex);
  const isAllCurrentPageSelected =
    currentPageOrders.length > 0 &&
    currentPageOrders.every((o) => selectedOrderIds.includes(o.id));
  const isSomeSelected =
    selectedOrderIds.length > 0 && !isAllCurrentPageSelected;

  const handleToggleSelectAll = () => {
    if (isAllCurrentPageSelected) {
      const currentIds = currentPageOrders.map((o) => o.id);
      setSelectedOrderIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      const currentIds = currentPageOrders.map((o) => o.id);
      setSelectedOrderIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  const handleToggleSelectOne = (id: string, checked: boolean) => {
    setSelectedOrderIds((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  // Batch Status Update
  const handleBatchStatus = async (status: OrderStatus) => {
    if (selectedOrderIds.length === 0) return;
    setIsBatchProcessing(true);
    try {
      const count = await orderRepository.batchUpdateStatus(selectedOrderIds, status);
      onToast(`已将 ${count} 笔订单状态更新`);
      setSelectedOrderIds([]);
      loadOrders();
    } catch (err: any) {
      onToast(`批量操作失败: ${err.message || '未知错误'}`);
    } finally {
      setIsBatchProcessing(false);
    }
  };

  // Batch Delete
  const handleConfirmBatchDelete = async () => {
    if (selectedOrderIds.length === 0) return;
    setIsBatchProcessing(true);
    try {
      const count = await orderRepository.batchDelete(selectedOrderIds);
      onToast(`已成功批量删除 ${count} 笔订单`);
      setSelectedOrderIds([]);
      setShowBatchDeleteConfirm(false);
      loadOrders();
    } catch (err: any) {
      onToast(`批量删除失败: ${err.message || '未知错误'}`);
    } finally {
      setIsBatchProcessing(false);
    }
  };

  // Batch Export CSV
  const handleExportCSV = (ordersToExport = orders) => {
    if (ordersToExport.length === 0) {
      onToast('当前无订单可导出');
      return;
    }

    const headers = [
      '订单编号',
      '类型',
      '客户昵称',
      '客户手机',
      '代练项目',
      '订单总额',
      '外包转单',
      '转单支出',
      '平台扣费',
      '实收净额',
      '游戏服务器',
      '获客平台',
      '订单状态',
      '创建时间',
      '备注',
    ];

    const rows = ordersToExport.map((o) => [
      formatNTEOrderNo(o.orderNo),
      o.type === 'hosting' ? '托管订单' : '普通订单',
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${o.customerPhone || ''}"`,
      `"${(o.project || '').replace(/"/g, '""')}"`,
      o.amount,
      o.isTransferred ? '是' : '否',
      o.transferAmount,
      o.platformFee,
      o.actualAmount,
      o.server,
      PLATFORM_LABELS[o.platform] || o.platform,
      o.status,
      o.createdAt,
      `"${(o.remark || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `MewFlow_Orders_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast(`成功导出 ${ordersToExport.length} 笔订单 CSV 表格！`);
  };

  // Export JSON Backup
  const handleExportJSON = async () => {
    try {
      const jsonString = await orderRepository.exportJSON();
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `MewFlow_Backup_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_')}.json`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onToast('已导出 JSON 备份文件！');
    } catch (err: any) {
      onToast(`导出备份失败: ${err.message}`);
    }
  };

  // Import JSON Backup
  const handleImportJSONSubmit = async () => {
    if (!importJsonText.trim()) {
      onToast('请输入或上传 JSON 数据内容');
      return;
    }
    setIsImporting(true);
    try {
      const result = await orderRepository.importJSON(importJsonText.trim(), importMode);
      onToast(`数据恢复成功！已导入 ${result.count} 笔订单`);
      setShowBackupModal(false);
      setImportJsonText('');
      loadOrders();
    } catch (err: any) {
      onToast(err.message || '导入数据格式错误');
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportJsonText(content);
        onToast(`已载入文件: ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  // Seed sample data
  const handleSeedData = async () => {
    try {
      await orderRepository.seedSampleData();
      onToast('已载入测试订单数据！');
      loadOrders();
    } catch {
      onToast('填充测试数据失败');
    }
  };

  // 渲染与全选使用同一份（已钳制页号的）切片
  const paginatedOrders = currentPageOrders;

  // 当删除/筛选导致总页数缩小后，将 currentPage 状态同步回有效范围
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Jump to a specific page
  const handleJumpToPage = () => {
    const parsed = parseInt(jumpPageInput, 10);
    if (isNaN(parsed)) return;
    const target = Math.min(Math.max(parsed, 1), totalPages);
    setCurrentPage(target);
    setJumpPageInput('');
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <PageHeader
        icon={ClipboardList}
        title="订单管理"
        description="普通订单与托管订单分表管理，支持快速录单、一键流转推进与批量处理"
        badgeText={`${totalOrders} 笔`}
        className="px-4 sm:px-5"
        actions={
          <div className="flex items-center gap-2">
            {/* Backup & Restore Action */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBackupModal(true)}
              leftIcon={<FileJson className="w-4 h-4 text-[#9333EA]" />}
              className="hidden sm:inline-flex text-xs border-[#E9D5FF] text-[#9333EA] hover:bg-[#FAF5FF]"
            >
              备份 / 还原
            </Button>

            {/* Export CSV Action */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportCSV(currentTypeOrders)}
              leftIcon={<FileSpreadsheet className="w-4 h-4 text-[#2E8B57]" />}
              className="hidden sm:inline-flex text-xs border-[#CCEED6] text-[#2E8B57] hover:bg-[#EAF7EE]"
            >
              导出 CSV
            </Button>

            {/* Seed Sample Action */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedData}
              leftIcon={<Sparkles className="w-4 h-4 text-[#FF5277]" />}
              className="hidden sm:inline-flex text-xs border-[#FFCCD7] text-[#FF5277] hover:bg-[#FFF2F5]"
            >
              测试数据
            </Button>

            {/* Create New Order Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={onCreateNew}
              leftIcon={<Plus className="w-4 h-4" />}
              className="font-bold shadow-xs text-xs sm:text-sm"
            >
              新建订单
            </Button>
          </div>
        }
      />

      {/* Tabs & Filter Bar Card */}
      <Card className="p-4 sm:p-5 border-[#F4E9E4] rounded-3xl space-y-4 shadow-xs">
        {/* Type Segment Tabs: 普通订单 / 托管订单（两套独立表格） */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F4E9E4] pb-3.5">
          <div
            className="inline-flex p-1 bg-[#FFF8F5] border border-[#F4E9E4] rounded-2xl self-start"
            role="tablist"
            aria-label="订单类型切换"
          >
            {TYPE_TABS.map((tab) => {
              const isActive = activeTypeTab === tab.id;
              const tabCount = tab.id === 'hosting' ? hostingOrders.length : standardOrders.length;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleTypeTabChange(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF6B8B] to-[#FF5277] text-white shadow-[0_2px_10px_0_rgba(255,82,119,0.28)]'
                      : 'text-[#635B69] hover:text-[#4A4450] hover:bg-[#FFF2F5]'
                  }`}
                >
                  {tab.id === 'hosting' ? (
                    <Briefcase className="w-4 h-4" />
                  ) : (
                    <ClipboardList className="w-4 h-4" />
                  )}
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none ${
                      isActive ? 'bg-white/25 text-white' : 'bg-[#FFF2F5] text-[#FF5277]'
                    }`}
                  >
                    {tabCount}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 flex-wrap text-xs text-[#8F8795]">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5277]" />
              <span className="font-semibold">
                {activeTypeTab === 'hosting'
                  ? '托管订单：长期包月、周期结算，支持批量推进'
                  : '普通订单：日常代练、一单一结，可快速推进'}
              </span>
            </div>
            <span className="h-3.5 w-px bg-[#EEDCD5]" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                共 <b className="text-[#4A4450] font-bold">{currentTypeOrders.length}</b> 笔
                {activeTypeTab === 'hosting' ? '托管' : '普通'}订单
              </span>
              {selectedOrderIds.length > 0 && (
                <span className="text-[#FF5277] font-bold">(已选 {selectedOrderIds.length} 笔)</span>
              )}
            </div>
          </div>
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* 1. Keyword Search */}
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F8795]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索单号 (#NTE...)、客户、手机、需求或备注"
              className="w-full h-10 pl-9 pr-8 bg-[#FFFFFF] border border-[#F4E9E4] focus:border-[#FF5277] focus:bg-[#FFFFFF] rounded-2xl text-xs sm:text-sm text-[#4A4450] placeholder-[#B5ABB9] outline-none transition-[box-shadow,border-color,background-color] shadow-2xs focus-visible:ring-2 focus-visible:ring-[#FF5277]/30"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="清空搜索关键词"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#8F8795] hover:text-[#4A4450] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 2. Status Select */}
          <div>
            <Select
              options={STATUS_OPTIONS}
              value={selectedStatus}
              onChange={(v) => setSelectedStatus(v as OrderStatus | 'all')}
              className="w-full"
              size="sm"
            />
          </div>

          {/* 3. Platform Select */}
          <div>
            <Select
              options={PLATFORM_OPTIONS}
              value={selectedPlatform}
              onChange={(v) => setSelectedPlatform(v as PlatformType | 'all')}
              className="w-full"
              size="sm"
            />
          </div>

          {/* 4. Server Select */}
          <div>
            <Select
              options={SERVER_OPTIONS}
              value={selectedServer}
              onChange={(v) => setSelectedServer(v as ServerType | 'all')}
              className="w-full"
              size="sm"
            />
          </div>

          {/* 5. Reset button */}
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-10 text-xs font-semibold text-[#FF5277] hover:text-[#E03A62] flex items-center justify-center gap-1.5 transition-colors px-3.5 rounded-2xl hover:bg-[#FFF2F5] border border-[#FFCCD7] bg-[#FFF8F5] cursor-pointer w-full"
              >
                <RotateCw className="w-4 h-4" />
                <span>清空筛选</span>
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Orders Content Area */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#FF5277] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold text-[#8F8795]">正在加载订单列表……</p>
        </div>
      ) : currentTypeOrders.length === 0 ? (
        /* Empty State */
        <Card className="py-14 sm:py-18 px-6 text-center flex flex-col items-center justify-center border-[#F4E9E4] rounded-3xl shadow-xs">
          <motion.div
            animate={{ y: [-3, 3, -3] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-4"
          >
            <MewMascot variant="sleeping" size={130} />
          </motion.div>

          <h3 className="text-lg sm:text-xl font-bold text-[#4A4450] mb-1.5 text-balance">
            {hasActiveFilters
              ? '没有找到符合条件的订单'
              : activeTypeTab === 'hosting'
              ? '暂无托管订单记录'
              : '暂无普通订单记录'}
          </h3>
          <p className="text-xs text-[#8F8795] max-w-md mb-6 leading-relaxed">
            {hasActiveFilters
              ? '当前筛选条件下暂无匹配记录，您可以尝试调整或清空筛选条件。'
              : activeTypeTab === 'hosting'
              ? '点击新建订单录入首笔托管订单，支持长期包月与周期结算。'
              : '点击新建订单或载入测试数据开始管理普通订单。'}
          </p>

          {hasActiveFilters ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleResetFilters}
              leftIcon={<RotateCw className="w-4 h-4" />}
              className="text-xs px-6 py-2.5 font-bold shadow-xs rounded-full"
            >
              清空所有筛选条件
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={onCreateNew}
              leftIcon={<Plus className="w-4 h-4" />}
              className="px-6 py-2.5 font-bold shadow-xs text-xs rounded-full"
            >
              新建订单
            </Button>
          )}
        </Card>
      ) : (
        /* Orders List */
        <div className="space-y-4">
          {/* Desktop & Tablet Consolidated Table */}
          <div className="hidden md:block bg-[#FFFCFB] border border-[#F4E9E4] rounded-3xl shadow-xs">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="border-b border-[#F4E9E4] text-xs font-bold text-[#554D5C]">
                  {/* Batch Select Checkbox */}
                  <th className="py-3.5 px-3 text-center w-10 bg-[#FFF8F5] rounded-tl-3xl">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={isAllCurrentPageSelected}
                        indeterminate={isSomeSelected}
                        onChange={handleToggleSelectAll}
                        ariaLabel="全选当前页订单"
                      />
                    </div>
                  </th>

                  {/* 普通 / 托管订单统一表格（收益维度，两 Tab 样式一致） */}
                  <>
                    <th className="py-3.5 px-3 text-left whitespace-nowrap w-[15%] bg-[#FFF8F5]">订单编号</th>
                    <th className="py-3.5 px-3 text-left whitespace-nowrap w-[13%] bg-[#FFF8F5]">客户</th>
                    <th className="py-3.5 px-3 text-left w-[24%] bg-[#FFF8F5]">项目内容</th>
                    <th className="py-3.5 px-3 text-right whitespace-nowrap w-[11%] bg-[#FFF8F5]">金额</th>
                    <th className="py-3.5 px-3 text-center whitespace-nowrap w-[9%] bg-[#FFF8F5]">状态</th>
                    <th className="py-3.5 px-3 text-center whitespace-nowrap w-[7%] bg-[#FFF8F5]">平台</th>
                    <th className="py-3.5 px-3 text-center whitespace-nowrap w-[9%] bg-[#FFF8F5]">创建时间</th>
                    <th className="py-3.5 px-4 text-center whitespace-nowrap w-[130px] bg-[#FFF8F5] rounded-tr-3xl">操作</th>
                  </>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4E9E4]">
                {paginatedOrders.map((order, rowIndex) => {
                  const isSelected = selectedOrderIds.includes(order.id);
                  const isCompleted = order.status === 'completed';
                  const isFinalState = order.status === 'completed' || order.status === 'cancelled';
                  const isLastRow = rowIndex === paginatedOrders.length - 1;

                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15 }}
                        className={`transition-colors group ${
                          isSelected
                            ? 'bg-[#FFF2F5]/80'
                            : isCompleted
                            ? 'bg-[#F9FCFA]/70 hover:bg-[#F0FAF3]'
                            : 'hover:bg-[#FFF8F5]/60'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className={`py-3.5 px-3 text-center ${isLastRow ? 'rounded-bl-3xl' : ''}`}>
                          <div className="flex items-center justify-center">
                            <Checkbox
                              checked={isSelected}
                              onChange={(checked) => handleToggleSelectOne(order.id, checked)}
                              ariaLabel={`选择订单 ${order.orderNo}`}
                            />
                          </div>
                        </td>

                        {/* 1. 订单编号 */}
                        <td className="py-3.5 px-3 text-left whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Tooltip content="复制订单编号" position="top">
                              <button
                                type="button"
                                onClick={(e) => handleCopyOrderNo(e, order.orderNo, order.id)}
                                className="group/code inline-flex items-center gap-1.5 text-sm font-semibold text-[#B84D67] hover:text-[#FF5277] hover:underline underline-offset-2 tracking-tight transition-colors cursor-pointer text-left"
                              >
                                <span>{formatNTEOrderNo(order.orderNo)}</span>
                                {copiedId === order.id ? (
                                  <Check className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 text-[#A399A8] opacity-0 group-hover/code:opacity-100 transition-opacity shrink-0" />
                                )}
                              </button>
                            </Tooltip>
                          </div>
                        </td>

                        {/* 2. 客户 */}
                        <td className="py-3.5 px-3 text-left whitespace-nowrap">
                          <div>
                            <span className="font-bold text-sm text-[#4A4450] block truncate max-w-[130px]">
                              {order.customerName}
                            </span>
                            {order.customerPhone ? (
                              <Tooltip content="复制客户手机号" position="top">
                                <button
                                  type="button"
                                  onClick={(e) => handleCopyPhone(e, order.customerPhone, order.id)}
                                  className="group/phone text-xs text-[#554D5C] hover:text-[#FF5277] font-semibold mt-0.5 inline-flex items-center gap-1 hover:underline underline-offset-2 cursor-pointer transition-colors text-left"
                                >
                                  <span>{order.customerPhone}</span>
                                  {copiedPhoneId === order.id ? (
                                    <Check className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5 text-[#A399A8] opacity-0 group-hover/phone:opacity-100 transition-opacity shrink-0" />
                                  )}
                                </button>
                              </Tooltip>
                            ) : (
                              <span className="block text-xs text-[#8F8795] mt-0.5">未填手机</span>
                            )}
                          </div>
                        </td>

                        {/* 3. 项目内容（普通 / 托管统一） */}
                        <td className="py-3.5 px-3 text-left">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="font-semibold text-sm text-[#4A4450] leading-relaxed break-words line-clamp-2"
                              title={order.project}
                            >
                              {order.project}
                            </span>
                            {order.isTransferred && (
                              <Tooltip content="外包转单：按 80% 结算分成" position="top">
                                <TransferredBadge rate="80%" />
                              </Tooltip>
                            )}
                          </div>
                        </td>

                        {/* 4. 金额（普通 / 托管统一：金额 + 实收） */}
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <div>
                            <span className="font-bold text-sm text-[#4A4450] block leading-tight font-mono">
                              {formatCurrency(order.amount)}
                            </span>
                            <span className="block text-xs text-[#2E7D32] font-semibold mt-0.5 font-mono">
                              实收 {formatCurrency(order.actualAmount)}
                            </span>
                          </div>
                        </td>

                        {/* 状态 */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <OrderStatusBadge status={order.status} />
                          </div>
                        </td>

                        {/* 平台 */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <PlatformBadge platform={order.platform} />
                          </div>
                        </td>

                        {/* 创建时间 */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <span className="text-xs text-[#554D5C] font-semibold">
                              {formatShortDateTime(order.createdAt)}
                            </span>
                          </div>
                        </td>

                        {/* 操作 (按顺序: 1.编辑 2.推进图标 3.删除) */}
                        <td className={`py-3.5 px-3 text-center whitespace-nowrap ${isLastRow ? 'rounded-br-3xl' : ''}`}>
                          <div className="flex items-center justify-center gap-1.5 mx-auto">
                            {/* 1. Edit Button */}
                            <Tooltip content="编辑订单" position="top">
                              <button
                                type="button"
                                onClick={() => onEditOrder(order.id)}
                                className="p-1.5 text-[#635B69] hover:text-[#FF5277] hover:bg-[#FFF2F5] rounded-xl transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            </Tooltip>

                            {/* 2. Advance Status Icon Only */}
                            {order.status === 'pending' && (
                              <Tooltip content="推进订单状态至「进行中」" position="top">
                                <button
                                  type="button"
                                  onClick={(e) => handleAdvanceStatus(e, order)}
                                  className="p-1.5 text-[#9333EA] hover:text-[#7E22CE] hover:bg-[#FAF5FF] rounded-xl transition-[transform,background-color,color] hover:scale-105 active:scale-95 cursor-pointer"
                                >
                                  <Zap className="w-4 h-4" />
                                </button>
                              </Tooltip>
                            )}

                            {order.status === 'in_progress' && (
                              <Tooltip content="推进订单状态至「已完成」" position="top">
                                <button
                                  type="button"
                                  onClick={(e) => handleAdvanceStatus(e, order)}
                                  className="p-1.5 text-[#2E855A] hover:text-[#276749] hover:bg-[#EAF7EE] rounded-xl transition-[transform,background-color,color] hover:scale-105 active:scale-95 cursor-pointer"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              </Tooltip>
                            )}

                            {isFinalState && (
                              <Tooltip content="订单已完结，无法继续推进" position="top">
                                <button
                                  type="button"
                                  disabled
                                  className="p-1.5 text-[#C4BAC7] rounded-xl cursor-not-allowed opacity-40"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              </Tooltip>
                            )}

                            {/* 3. Delete Button */}
                            <Tooltip content="删除订单" position="top">
                              <button
                                type="button"
                                onClick={() => setDeletingOrder(order)}
                                className="p-1.5 text-[#8F8795] hover:text-[#E05368] hover:bg-[#FFF0F3] rounded-xl transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards (Visible on mobile viewports < md) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {paginatedOrders.map((order) => {
              const isSelected = selectedOrderIds.includes(order.id);
              const isFinalState = order.status === 'completed' || order.status === 'cancelled';

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                >
                    <Card
                      className={`p-4 border-[#F4E9E4] rounded-3xl relative overflow-hidden transition-[box-shadow,border-color,background-color] ${
                        isSelected ? 'bg-[#FFF2F5] ring-2 ring-[#FFCCD7]' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-[#F4E9E4]">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={isSelected}
                            onChange={(checked) => handleToggleSelectOne(order.id, checked)}
                            ariaLabel={`选择订单 ${order.orderNo}`}
                          />
                          <button
                            type="button"
                            onClick={(e) => handleCopyOrderNo(e, order.orderNo, order.id)}
                            className="text-sm font-semibold text-[#B86B7E] hover:text-[#FF5277] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>{formatNTEOrderNo(order.orderNo)}</span>
                            {copiedId === order.id ? (
                              <Check className="w-3.5 h-3.5 text-[#429054]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-[#B5ABB9]" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <PlatformBadge platform={order.platform} />
                          <OrderStatusBadge status={order.status} />
                        </div>
                      </div>

                      <div className="space-y-2 mb-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[#8F8795]">客户</span>
                          <div className="text-right">
                            <span className="font-bold text-sm text-[#4A4450] block">{order.customerName}</span>
                            {order.customerPhone ? (
                              <button
                                type="button"
                                onClick={(e) => handleCopyPhone(e, order.customerPhone, order.id)}
                                className="text-xs text-[#8F8795] hover:text-[#FF5277] inline-flex items-center gap-1 hover:underline underline-offset-2 cursor-pointer mt-0.5"
                              >
                                <span>{order.customerPhone}</span>
                                {copiedPhoneId === order.id ? (
                                  <Check className="w-3.5 h-3.5 text-[#429054]" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 text-[#B5ABB9]" />
                                )}
                              </button>
                            ) : (
                              <span className="text-xs text-[#B5ABB9] mt-0.5 block">未填手机</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[#8F8795]">项目</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-sm text-[#4A4450] break-words line-clamp-2 max-w-[200px]" title={order.project}>
                              {order.project}
                            </span>
                            {order.isTransferred && (
                              <Tooltip content="外包转单：按 80% 结算分成" position="top">
                                <TransferredBadge rate="80%" />
                              </Tooltip>
                            )}
                          </div>
                        </div>

                        {/* 普通 / 托管统一：金额 / 实收 */}
                        <div className="flex items-center justify-between pt-1.5 border-t border-dashed border-[#F4E9E4]">
                          <span className="text-[#8F8795]">金额 / 实收</span>
                          <div className="text-right">
                            <span className="font-bold text-sm text-[#4A4450] font-mono">
                              {formatCurrency(order.amount)}
                            </span>
                            <span className="text-[#429054] text-xs ml-1.5 font-semibold font-mono">
                              (实收 {formatCurrency(order.actualAmount)})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mobile Card Bottom Actions */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-[#F4E9E4] text-xs text-[#554D5C]">
                        <span className="text-xs font-semibold text-[#554D5C]">
                          {formatShortDateTime(order.createdAt)}
                        </span>

                        <div className="flex items-center gap-1">
                          {/* 1. Edit */}
                          <button
                            type="button"
                            aria-label="编辑订单"
                            onClick={() => onEditOrder(order.id)}
                            className="p-1.5 text-[#635B69] hover:text-[#FF5277] rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* 2. Advance Status Icon */}
                          {order.status === 'pending' && (
                            <button
                              type="button"
                              aria-label="推进订单状态至「进行中」"
                              onClick={(e) => handleAdvanceStatus(e, order)}
                              className="p-1.5 text-[#9333EA] hover:bg-[#FAF5FF] rounded-lg transition-colors"
                            >
                              <Zap className="w-4 h-4" />
                            </button>
                          )}
                          {order.status === 'in_progress' && (
                            <button
                              type="button"
                              aria-label="推进订单状态至「已完成」"
                              onClick={(e) => handleAdvanceStatus(e, order)}
                              className="p-1.5 text-[#2E855A] hover:bg-[#EAF7EE] rounded-lg transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          {isFinalState && (
                            <button
                              type="button"
                              aria-label="订单已完结"
                              disabled
                              className="p-1.5 text-[#C4BAC7] rounded-lg opacity-40 cursor-not-allowed"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* 3. Delete */}
                          <button
                            type="button"
                            aria-label="删除订单"
                            onClick={() => setDeletingOrder(order)}
                            className="p-1.5 text-[#8F8795] hover:text-[#E05368] rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
          </div>

          {/* Pagination Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-2 text-xs text-[#635B69]">
            <div className="flex items-center gap-2">
              <span>每页显示</span>
              <Select
                options={PAGE_SIZE_OPTIONS}
                value={pageSize}
                onChange={(v) => {
                  setPageSize(Number(v));
                  setCurrentPage(1);
                  setJumpPageInput('');
                }}
                size="xs"
                className="w-24"
              />
              <span>条，共 <b className="text-[#4A4450]">{totalOrders}</b> 笔订单</span>
            </div>

            {/* 分页导航：上一页 | 当前页 | 下一页（成组） · 单页时自动隐藏 */}
            {totalPages > 1 && (
              <>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safeCurrentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-xl text-xs h-8 w-8 flex items-center justify-center"
                    aria-label="上一页"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <span className="font-semibold text-[#7A7280] px-0.5 tabular-nums whitespace-nowrap">
                    第 <b className="text-[#4A4450]">{safeCurrentPage}</b> / {totalPages} 页
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safeCurrentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-xl text-xs h-8 w-8 flex items-center justify-center"
                    aria-label="下一页"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* 快速跳转指定页 */}
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="font-semibold text-[#8F8795]">跳至</span>
                  <input
                    type="number"
                    name="page-jump"
                    inputMode="numeric"
                    autoComplete="off"
                    min={1}
                    max={totalPages}
                    value={jumpPageInput}
                    onChange={(e) => setJumpPageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleJumpToPage();
                    }}
                    placeholder={String(safeCurrentPage)}
                    aria-label="跳转到指定页"
                    className="w-14 h-8 px-2 text-center text-xs font-bold text-[#4A4450] bg-[#FFFCFB] border border-[#F4E9E4] rounded-xl outline-none transition-[box-shadow,border-color] focus:border-[#FF5277] focus:ring-2 focus:ring-[#FF5277]/30 placeholder-[#C4BAC7] tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="font-semibold text-[#8F8795]">页</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleJumpToPage}
                    disabled={!jumpPageInput.trim()}
                    leftIcon={<CornerDownLeft className="w-3.5 h-3.5" />}
                    className="h-8 px-3 rounded-xl text-xs font-bold border-[#FFCCD7] text-[#FF5277] hover:bg-[#FFF2F5]"
                    aria-label="跳转页面"
                  >
                    跳转
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating Bottom Batch Action Bar */}
      <AnimatePresence>
        {selectedOrderIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#4A4450] text-white px-5 py-3 rounded-full shadow-[0_8px_30px_rgba(74,68,80,0.35)] flex items-center gap-3.5 border border-[#635B69] max-w-[95vw] overflow-x-auto"
          >
            <div className="flex items-center gap-2 text-xs font-bold shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#FF5277] animate-pulse" />
              <span>已勾选 {selectedOrderIds.length} 笔订单</span>
            </div>

            <div className="h-4 w-px bg-[#635B69] shrink-0" />

            <div className="flex items-center gap-2 shrink-0">
              {/* Advance to In-Progress */}
              <button
                type="button"
                disabled={isBatchProcessing}
                onClick={() => handleBatchStatus('in_progress')}
                className="text-xs px-3 py-1.5 rounded-full bg-[#5D5564] hover:bg-[#6F6677] text-white transition-colors flex items-center gap-1 cursor-pointer font-semibold"
              >
                <Zap className="w-3.5 h-3.5 text-[#E9D5FF]" />
                <span>转为进行中</span>
              </button>

              {/* Advance to Completed */}
              <button
                type="button"
                disabled={isBatchProcessing}
                onClick={() => handleBatchStatus('completed')}
                className="text-xs px-3 py-1.5 rounded-full bg-[#2F855A] hover:bg-[#276749] text-white transition-colors flex items-center gap-1 cursor-pointer font-semibold"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#CCEED6]" />
                <span>标记完成</span>
              </button>

              {/* Export Selected CSV */}
              <button
                type="button"
                disabled={isBatchProcessing}
                onClick={() => {
                  const selected = orders.filter((o) => selectedOrderIds.includes(o.id));
                  handleExportCSV(selected);
                }}
                className="text-xs px-3 py-1.5 rounded-full bg-[#5D5564] hover:bg-[#6F6677] text-white transition-colors flex items-center gap-1 cursor-pointer font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>导出所选</span>
              </button>

              {/* Batch Delete */}
              <button
                type="button"
                disabled={isBatchProcessing}
                onClick={() => setShowBatchDeleteConfirm(true)}
                className="text-xs px-3 py-1.5 rounded-full bg-[#E03A62] hover:bg-[#C82A50] text-white transition-colors flex items-center gap-1 cursor-pointer font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>批量删除</span>
              </button>
            </div>

            <div className="h-4 w-px bg-[#635B69] shrink-0" />

            <button
              type="button"
              onClick={() => setSelectedOrderIds([])}
              className="text-xs text-[#B5ABB9] hover:text-white transition-colors cursor-pointer shrink-0"
            >
              取消
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backup & Restore Modal */}
      <AnimatePresence>
        {showBackupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBackupModal(false)}
              className="fixed inset-0 bg-[#4A4450]/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              role="dialog"
              aria-modal="true"
              aria-label="数据备份与导入恢复"
              className="relative z-10 w-full max-w-lg bg-[#FFFCFB] border border-[#F4E9E4] rounded-3xl p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F4E9E4]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] flex items-center justify-center text-[#9333EA]">
                    <FileJson className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#4A4450]">数据备份与导入恢复</h3>
                    <p className="text-xs text-[#8F8795]">完整导出或导入全站订单数据</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBackupModal(false)}
                  aria-label="关闭备份窗口"
                  className="p-1.5 text-[#8F8795] hover:text-[#4A4450] rounded-xl"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* 1. Export Action */}
                <div className="p-4 bg-[#FFF8F5] border border-[#F4E9E4] rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#4A4450]">导出本地全量备份</h4>
                    <p className="text-[11px] text-[#8F8795] mt-0.5">下载当前所有订单数据为 .json 文件</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportJSON}
                    leftIcon={<Download className="w-4 h-4" />}
                    className="text-xs"
                  >
                    下载备份
                  </Button>
                </div>

                {/* 2. Import Action */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#4A4450]">导入数据恢复</label>
                    <div className="flex items-center gap-2 text-xs">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          value="merge"
                          checked={importMode === 'merge'}
                          onChange={() => setImportMode('merge')}
                          className="text-[#FF5277]"
                        />
                        <span>增量合并</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer text-[#E03A62]">
                        <input
                          type="radio"
                          name="importMode"
                          value="replace"
                          checked={importMode === 'replace'}
                          onChange={() => setImportMode('replace')}
                          className="text-[#E03A62]"
                        />
                        <span>完全覆盖</span>
                      </label>
                    </div>
                  </div>

                  <textarea
                    rows={4}
                    value={importJsonText}
                    onChange={(e) => setImportJsonText(e.target.value)}
                    placeholder="在此粘贴 JSON 数据，或点击下方按钮直接读取 .json 备份文件..."
                    className="w-full p-3 bg-white border border-[#F4E9E4] rounded-2xl text-xs font-mono text-[#4A4450] placeholder-[#B5ABB9] outline-none focus:border-[#FF5277]"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".json,application/json"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      leftIcon={<Upload className="w-4 h-4" />}
                      className="text-xs"
                    >
                      选择备份文件
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowBackupModal(false)}
                        className="text-xs"
                      >
                        取消
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={!importJsonText.trim() || isImporting}
                        onClick={handleImportJSONSubmit}
                        isLoading={isImporting}
                        className="text-xs font-bold"
                      >
                        确认导入
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Single Delete Confirm Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deletingOrder}
        orderNo={deletingOrder?.orderNo}
        onCancel={() => setDeletingOrder(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Batch Delete Confirm Dialog */}
      <AnimatePresence>
        {showBatchDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A4450]/40 backdrop-blur-xs"
            onClick={() => setShowBatchDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              role="dialog"
              aria-modal="true"
              aria-label="批量删除确认"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#FFFCFB] border border-[#FFCCD7] rounded-3xl p-6 shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FFF2F5] border border-[#FFCCD7] flex items-center justify-center text-[#FF5277]">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-base font-bold text-[#4A4450]">
                  确认批量删除所选订单吗？
                </h4>
                <p className="text-xs text-[#635B69] mt-1.5 leading-relaxed">
                  即将永久删除选中的 <b className="text-[#FF5277]">{selectedOrderIds.length}</b> 笔订单记录，此操作无法撤销。
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBatchDeleteConfirm(false)}
                  className="flex-1 rounded-full"
                >
                  取消
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleConfirmBatchDelete}
                  className="flex-1 rounded-full bg-[#E05368] hover:bg-[#C94054] text-white"
                >
                  确认删除
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
