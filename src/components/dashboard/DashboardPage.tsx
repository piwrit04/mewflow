import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  RotateCw,
  CheckCircle2,
  ListTodo,
  ArrowRight,
  Sparkles,
  Zap,
  Gamepad2,
  ClipboardList,
  Rocket,
  Lightbulb,
} from 'lucide-react';
import { MewMascot } from '../brand/MewMascot';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Tooltip } from '../ui/Tooltip';
import { ToastContainer, type ToastMessage } from '../ui/Toast';
import { AppLayout } from '../layout/AppLayout';
import { OrdersListPage } from '../orders/OrdersListPage';
import { OrderFormModal } from '../orders/OrderFormModal';
import { OrderStatusBadge, OrderTypeBadge, TransferredBadge } from '../orders/OrderStatusBadge';
import { orderRepository } from '../../repositories';
import {
  Order,
  OrderStatus,
  OrderSummaryStats,
  NavTabId,
} from '../../types';
import { formatCurrency, formatDateTime } from '../../services/settlementService';

interface DashboardPageProps {
  username: string;
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ username, onLogout }) => {
  const [activeTab, setActiveTab] = useState<NavTabId>('dashboard');
  const [initialOrderStatusFilter, setInitialOrderStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modal State for New / Edit Order
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [modalOrderId, setModalOrderId] = useState<string | undefined>(undefined);
  const [ordersListRefreshKey, setOrdersListRefreshKey] = useState(0);

  // Real-time Summary Stats for Dashboard
  const [stats, setStats] = useState<OrderSummaryStats>({
    pendingCount: 0,
    inProgressCount: 0,
    completedTodayCount: 0,
    totalCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const addToast = (text: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Refresh statistics & recent orders
  const refreshStats = async () => {
    setIsLoadingStats(true);
    try {
      const summary = await orderRepository.getSummaryStats();
      const all = await orderRepository.getAll();
      setStats(summary);
      setRecentOrders(all.slice(0, 5)); // Take latest 5 orders
    } catch {
      // Graceful fallback
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    refreshStats();
  }, [activeTab]);

  const handleNavClick = (tabId: NavTabId, tabLabel: string) => {
    if (tabId === 'dashboard') {
      setActiveTab('dashboard');
      refreshStats();
    } else if (tabId === 'orders') {
      setActiveTab('orders');
      setInitialOrderStatusFilter('all');
    } else {
      addToast(`${tabLabel}功能还在准备中哦～`);
    }
  };

  const handleOpenCreateModal = () => {
    setModalOrderId(undefined);
    setIsOrderModalOpen(true);
  };

  const handleOpenEditModal = (orderId: string) => {
    setModalOrderId(orderId);
    setIsOrderModalOpen(true);
  };

  const handleStatCardClick = (statusFilter?: OrderStatus) => {
    setActiveTab('orders');
    setInitialOrderStatusFilter(statusFilter || 'all');
  };

  return (
    <AppLayout
      username={username}
      activeTab={activeTab}
      onSelectTab={handleNavClick}
      onLogout={onLogout}
    >
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Unified Order Form Modal (New & Edit with Dirty Guard) */}
      <OrderFormModal
        isOpen={isOrderModalOpen}
        orderId={modalOrderId}
        onClose={() => setIsOrderModalOpen(false)}
        onSaved={(_savedOrder, _isNew) => {
          refreshStats();
          setOrdersListRefreshKey((prev) => prev + 1);
        }}
        onToast={addToast}
      />

      <AnimatePresence mode="wait">
        {activeTab === 'orders' ? (
          /* Orders Tab (Single-View Consolidated List) */
          <motion.div
            key="tab-orders"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <OrdersListPage
              initialStatusFilter={initialOrderStatusFilter}
              refreshKey={ordersListRefreshKey}
              onCreateNew={handleOpenCreateModal}
              onEditOrder={handleOpenEditModal}
              onToast={addToast}
            />
          </motion.div>
        ) : (
          /* Dashboard Tab */
          <motion.div
            key="tab-dashboard"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-4 sm:gap-5"
          >
            {/* 1. Top Compact Welcome Banner */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="relative overflow-hidden py-4 px-5 sm:py-5 sm:px-6 bg-gradient-to-br from-[#FFFCFB] to-[#FFF5F7] border-[#F4E9E4] shadow-xs rounded-3xl">
                {/* Soft decorative blur */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFB6C1]/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    {/* Mascot Avatar Icon */}
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#FFF2F5] to-[#FFE5EC] border border-[#FFCCD7] flex items-center justify-center shrink-0 shadow-[0_2px_8px_0_rgba(255,82,119,0.12)]">
                      <MewMascot variant="avatar" size={34} />
                    </div>

                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[#4A4450] tracking-tight text-balance">
                        欢迎回来，{username}！
                      </h2>
                      <p className="text-xs sm:text-sm text-[#8F8795] mt-0.5 flex items-center gap-1 font-semibold">
                        <span>让每一单，都井井有喵～</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleOpenCreateModal}
                      leftIcon={<Plus className="w-4 h-4" />}
                      className="font-bold rounded-full shadow-xs text-xs sm:text-sm px-5"
                    >
                      新建订单
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* 2. Key Order Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {/* Pending Orders Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
              >
                <Card
                  className="p-4 sm:p-5 hover:border-[#FFCCD7] transition-colors cursor-pointer border-[#F4E9E4] group rounded-3xl shadow-xs"
                  onClick={() => handleStatCardClick('pending')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#5A5260]">待处理订单</span>
                    <span className="w-2 h-2 rounded-full bg-[#FF5277] animate-pulse" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#4A4450] group-hover:text-[#FF5277] transition-colors font-mono">
                      {stats.pendingCount}
                    </span>
                    <span className="text-xs font-semibold text-[#5A5260]">单</span>
                  </div>
                  <p className="text-xs text-[#635B69] font-semibold mt-1.5 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-[#FF5277]" />
                    <span>等待确认或安排</span>
                  </p>
                </Card>
              </motion.div>

              {/* In-Progress Orders Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card
                  className="p-4 sm:p-5 hover:border-[#E9D5FF] transition-colors cursor-pointer border-[#F4E9E4] group rounded-3xl shadow-xs"
                  onClick={() => handleStatCardClick('in_progress')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#5A5260]">进行中订单</span>
                    <span className="w-2 h-2 rounded-full bg-[#9333EA] animate-pulse" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#4A4450] group-hover:text-[#9333EA] transition-colors font-mono">
                      {stats.inProgressCount}
                    </span>
                    <span className="text-xs font-semibold text-[#5A5260]">单</span>
                  </div>
                  <p className="text-xs text-[#635B69] font-semibold mt-1.5 flex items-center gap-1">
                    <Gamepad2 className="w-3.5 h-3.5 text-[#9333EA]" />
                    <span>正在努力肝单中</span>
                  </p>
                </Card>
              </motion.div>

              {/* Completed Today Orders Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                <Card
                  className="p-4 sm:p-5 hover:border-[#CCEED6] transition-colors cursor-pointer border-[#F4E9E4] group rounded-3xl shadow-xs"
                  onClick={() => handleStatCardClick('completed')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#5A5260]">今日已完成</span>
                    <span className="w-2 h-2 rounded-full bg-[#2F855A]" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#4A4450] group-hover:text-[#2F855A] transition-colors font-mono">
                      {stats.completedTodayCount}
                    </span>
                    <span className="text-xs font-semibold text-[#5A5260]">单</span>
                  </div>
                  <p className="text-xs text-[#635B69] font-semibold mt-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#2F855A]" />
                    <span>辛苦啦！收获满满</span>
                  </p>
                </Card>
              </motion.div>

              {/* Total Orders Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card
                  className="p-4 sm:p-5 hover:border-[#FFE8B3] transition-colors cursor-pointer border-[#F4E9E4] group rounded-3xl shadow-xs"
                  onClick={() => handleStatCardClick()}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#5A5260]">历史总订单</span>
                    <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#4A4450] group-hover:text-[#D97706] transition-colors font-mono">
                      {stats.totalCount}
                    </span>
                    <span className="text-xs font-semibold text-[#5A5260]">单</span>
                  </div>
                  <p className="text-xs text-[#635B69] font-semibold mt-1.5 flex items-center gap-1">
                    <ClipboardList className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>累计托管与普通单</span>
                  </p>
                </Card>
              </motion.div>
            </div>

            {/* 3. Main Dashboard Body: Recent Orders + Quick Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Recent Orders List Preview */}
              <Card className="lg:col-span-2 p-4 sm:p-5 border-[#F4E9E4] flex flex-col justify-between rounded-3xl shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-[#F4E9E4]">
                    <div className="flex items-center gap-2">
                      <ListTodo className="w-4 h-4 text-[#FF5277]" />
                      <h3 className="font-bold text-sm sm:text-base text-[#4A4450]">
                        近期活跃订单
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleNavClick('orders', '订单')}
                      className="text-xs font-bold text-[#635B69] hover:text-[#FF5277] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>进入管理台</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isLoadingStats ? (
                    <div className="py-12 flex justify-center items-center">
                      <div className="w-6 h-6 border-2 border-[#FF5277] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : recentOrders.length === 0 ? (
                    <div className="py-10 text-center flex flex-col items-center justify-center">
                      <MewMascot variant="sleeping" size={100} />
                      <p className="text-xs font-semibold text-[#635B69] mt-2">
                        还没有订单记录哦，赶紧创建第一单吧喵～
                      </p>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleOpenCreateModal}
                        className="mt-3 text-xs rounded-full px-5 font-bold"
                      >
                        新建第一单
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#F4E9E4]">
                      {recentOrders.map((order) => (
                        <div
                          key={order.id}
                          onClick={() => handleOpenEditModal(order.id)}
                          className="py-3 flex items-center justify-between gap-3 hover:bg-[#FFF8F5]/70 rounded-2xl px-2.5 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <OrderTypeBadge type={order.type} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs sm:text-sm text-[#4A4450] truncate group-hover:text-[#FF5277] transition-colors">
                                  {order.project}
                                </span>
                                {order.isTransferred && (
                                  <Tooltip content="外包转单：按 80% 结算分成" position="top">
                                    <TransferredBadge rate="80%" />
                                  </Tooltip>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-[#635B69] font-semibold mt-0.5 font-mono">
                                <span className="text-[#5A5260] font-semibold">{order.customerName}</span>
                                <span className="text-[#A399A8]">·</span>
                                <span>{formatDateTime(order.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <span className="font-extrabold text-xs sm:text-sm text-[#4A4450] block font-mono">
                                {formatCurrency(order.amount)}
                              </span>
                              <span className="text-[11px] text-[#2E7D32] font-bold font-mono">
                                实收 {formatCurrency(order.actualAmount)}
                              </span>
                            </div>
                            <OrderStatusBadge status={order.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {recentOrders.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#F4E9E4] flex items-center justify-between text-xs text-[#635B69] font-semibold">
                    <span>✨ 持续更新同步中</span>
                    <button
                      type="button"
                      onClick={refreshStats}
                      className="flex items-center gap-1 text-[#635B69] hover:text-[#4A4450] transition-colors font-semibold cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>刷新</span>
                    </button>
                  </div>
                )}
              </Card>

              {/* Quick Actions & Tips Sidebar Card */}
              <div className="flex flex-col gap-4">
                {/* Quick Operation Card */}
                <Card className="p-4 sm:p-5 border-[#F4E9E4] rounded-3xl shadow-xs">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#F4E9E4]">
                    <Rocket className="w-4 h-4 text-[#FF5277]" />
                    <h3 className="font-bold text-sm sm:text-base text-[#4A4450] text-balance">
                      快捷操作
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleOpenCreateModal}
                      leftIcon={<Plus className="w-4 h-4" />}
                      className="w-full justify-start font-bold text-xs sm:text-sm py-2.5 rounded-2xl"
                    >
                      录入新订单
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNavClick('orders', '订单')}
                      leftIcon={<ListTodo className="w-4 h-4 text-[#FF5277]" />}
                      className="w-full justify-start text-xs sm:text-sm py-2.5 rounded-2xl text-[#4A4450] font-semibold"
                    >
                      打开订单管理台
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await orderRepository.seedSampleData();
                          addToast('已成功载入多笔测试订单');
                          refreshStats();
                        } catch {
                          addToast('载入数据失败，请重试');
                        }
                      }}
                      leftIcon={<RotateCw className="w-4 h-4 text-[#9333EA]" />}
                      className="w-full justify-start text-xs sm:text-sm py-2.5 rounded-2xl text-[#4A4450] font-semibold"
                    >
                      填充演示测试数据
                    </Button>
                  </div>
                </Card>

                {/* Settlement Tip Card */}
                <Card className="p-4 sm:p-5 border-[#F4E9E4] bg-gradient-to-br from-[#FFFCFB] to-[#FFF9EA]/60 rounded-3xl shadow-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-[#D97706]" />
                    <h4 className="font-bold text-xs sm:text-sm text-[#4A4450] text-balance">
                      智能结算公式提示
                    </h4>
                  </div>
                  <div className="text-xs text-[#5A5260] space-y-1.5 leading-relaxed font-semibold">
                    <p className="flex items-start gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0 mt-0.5" />
                      <span><strong>闲鱼单</strong>：自动扣除 1.6% 官方交易提现费</span>
                    </p>
                    <p className="flex items-start gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0 mt-0.5" />
                      <span><strong>外包转单</strong>：自动按 80% 拆出打手支出，计算纯利</span>
                    </p>
                    <p className="flex items-start gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0 mt-0.5" />
                      <span><strong>微信直款</strong>：0% 平台手续费，100% 实收</span>
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};
