import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Save,
  AlertCircle,
  Calculator,
  User,
  ClipboardList,
  Coins,
  Layers,
  Gamepad2,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Select, SelectOption } from '../ui/Select';
import {
  Order,
  OrderType,
  OrderStatus,
  ServerType,
  PlatformType,
} from '../../types';
import { orderRepository } from '../../repositories';
import {
  calculateSettlement,
  formatCurrency,
  formatNTEOrderNo,
  ORDER_TYPE_LABELS,
  ORDER_STATUS_LABELS,
  SERVER_LABELS,
  PLATFORM_LABELS,
} from '../../services/settlementService';
import {
  DEFAULT_PROJECT_CATEGORIES,
  ProjectCategory,
} from '../../data/projectCategories';

const SERVER_FORM_OPTIONS: SelectOption<ServerType>[] = [
  { value: 'official', label: SERVER_LABELS.official },
  { value: 'bilibili', label: SERVER_LABELS.bilibili },
  { value: 'international', label: SERVER_LABELS.international },
];

const STATUS_FORM_OPTIONS: SelectOption<OrderStatus>[] = [
  { value: 'pending', label: ORDER_STATUS_LABELS.pending },
  { value: 'in_progress', label: ORDER_STATUS_LABELS.in_progress },
  { value: 'completed', label: ORDER_STATUS_LABELS.completed },
  { value: 'cancelled', label: ORDER_STATUS_LABELS.cancelled },
];

export interface OrderFormModalProps {
  isOpen: boolean;
  orderId?: string; // If provided, modal operates in Edit mode
  onClose: () => void;
  onSaved: (savedOrder: Order, isNew: boolean) => void;
  onToast: (text: string) => void;
}

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  isOpen,
  orderId,
  onClose,
  onSaved,
  onToast,
}) => {
  const isEditMode = !!orderId;
  const categories: ProjectCategory[] = DEFAULT_PROJECT_CATEGORIES;

  // Form States
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [type, setType] = useState<OrderType>('standard');
  const [parentCategory, setParentCategory] = useState<string>(categories[0].id);
  const [childCategory, setChildCategory] = useState<string>(categories[0].items[0]);
  const [amount, setAmount] = useState<string>('');
  const [server, setServer] = useState<ServerType>('official');
  const [platform, setPlatform] = useState<PlatformType>('xianyu');
  const [remark, setRemark] = useState('');
  const [isTransferred, setIsTransferred] = useState(false);
  const [status, setStatus] = useState<OrderStatus>('pending');

  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [existingOrderNo, setExistingOrderNo] = useState('');

  // Dirty state tracking & Confirmation dialog
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const initialDataRef = useRef<string>('');

  // Parent categories options for Select
  const parentOptions: SelectOption<string>[] = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  const currentCategory = categories.find((c) => c.id === parentCategory) || categories[0];

  const childOptions: SelectOption<string>[] = currentCategory.items.map((item) => ({
    value: item,
    label: item,
  }));

  const handleParentCategoryChange = (newParentId: string) => {
    setParentCategory(newParentId);
    const matched = categories.find((c) => c.id === newParentId);
    if (matched && matched.items.length > 0) {
      setChildCategory(matched.items[0]);
    }
  };

  const computeSnapshot = (
    cName: string,
    cPhone: string,
    t: OrderType,
    pCat: string,
    cCat: string,
    amt: string,
    srv: ServerType,
    plt: PlatformType,
    rem: string,
    trans: boolean,
    st: OrderStatus
  ) => {
    return JSON.stringify({ cName, cPhone, t, pCat, cCat, amt, srv, plt, rem, trans, st });
  };

  const isFormDirty = () => {
    const currentSnapshot = computeSnapshot(
      customerName,
      customerPhone,
      type,
      parentCategory,
      childCategory,
      amount,
      server,
      platform,
      remark,
      isTransferred,
      status
    );
    return currentSnapshot !== initialDataRef.current;
  };

  // Reset or load order data when modal opens
  useEffect(() => {
    if (!isOpen) {
      setErrorMsg(null);
      setShowUnsavedConfirm(false);
      return;
    }

    if (orderId) {
      const loadOrderData = async () => {
        setIsLoadingOrder(true);
        setErrorMsg(null);
        try {
          const data = await orderRepository.getById(orderId);
          if (data) {
            setCustomerName(data.customerName);
            setCustomerPhone(data.customerPhone || '');
            setType(data.type);
            setAmount(data.amount > 0 ? data.amount.toString() : '');
            setServer(data.server);
            setPlatform(data.platform);
            setRemark(data.remark || '');
            setIsTransferred(data.isTransferred);
            setStatus(data.status);
            setExistingOrderNo(data.orderNo);

            const projectStr = data.project || '';
            let matchedParent = categories[0];
            let matchedChild = projectStr;

            for (const cat of categories) {
              if (projectStr.includes(cat.name)) {
                matchedParent = cat;
                break;
              }
              const foundInItems = cat.items.some((it) => projectStr.includes(it));
              if (foundInItems) {
                matchedParent = cat;
                break;
              }
            }

            setParentCategory(matchedParent.id);
            const foundExactItem = matchedParent.items.find((it) => projectStr.includes(it));
            if (foundExactItem) {
              setChildCategory(foundExactItem);
              matchedChild = foundExactItem;
            } else if (matchedParent.items.length > 0) {
              setChildCategory(matchedParent.items[0]);
              matchedChild = matchedParent.items[0];
            }

            initialDataRef.current = computeSnapshot(
              data.customerName,
              data.customerPhone || '',
              data.type,
              matchedParent.id,
              matchedChild,
              data.amount > 0 ? data.amount.toString() : '',
              data.server,
              data.platform,
              data.remark || '',
              data.isTransferred,
              data.status
            );
          } else {
            setErrorMsg('未找到指定订单');
          }
        } catch {
          setErrorMsg('加载订单数据失败');
        } finally {
          setIsLoadingOrder(false);
        }
      };

      loadOrderData();
    } else {
      setCustomerName('');
      setCustomerPhone('');
      setType('standard');
      setParentCategory(categories[0].id);
      setChildCategory(categories[0].items[0]);
      setAmount('');
      setServer('official');
      setPlatform('xianyu');
      setRemark('');
      setIsTransferred(false);
      setStatus('pending');
      setExistingOrderNo('');
      setIsLoadingOrder(false);
      setErrorMsg(null);

      initialDataRef.current = computeSnapshot(
        '',
        '',
        'standard',
        categories[0].id,
        categories[0].items[0],
        '',
        'official',
        'xianyu',
        '',
        false,
        'pending'
      );
    }
  }, [isOpen, orderId]);

  const requestClose = () => {
    if (isSubmitting) return;
    if (isFormDirty()) {
      setShowUnsavedConfirm(true);
    } else {
      onClose();
    }
  };

  // Keyboard shortcut listener: ESC & Ctrl+Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape' && !isSubmitting) {
        if (showUnsavedConfirm) {
          setShowUnsavedConfirm(false);
        } else {
          requestClose();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const form = document.getElementById('order-form') as HTMLFormElement;
        if (form) form.requestSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, showUnsavedConfirm, customerName, customerPhone, type, parentCategory, childCategory, amount, server, platform, remark, isTransferred, status]);

  const numericAmount = parseFloat(amount) || 0;
  const settlement = calculateSettlement({
    type,
    amount: numericAmount,
    isTransferred,
    platform,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim()) {
      setErrorMsg('请填写客户姓名或昵称喵～');
      return;
    }

    if (numericAmount <= 0) {
      setErrorMsg('请输入大于 0 的有效订单金额');
      return;
    }

    const fullProjectName = `${currentCategory.name} - ${childCategory}`;

    setIsSubmitting(true);
    try {
      if (isEditMode && orderId) {
        const updated = await orderRepository.update(orderId, {
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim() || undefined,
          type,
          project: fullProjectName,
          amount: numericAmount,
          server,
          platform,
          remark: remark.trim() || undefined,
          isTransferred,
          status,
        });

        onToast(`订单 ${formatNTEOrderNo(updated.orderNo)} 修改成功！`);
        onSaved(updated, false);
        onClose();
      } else {
        const created = await orderRepository.create({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim() || undefined,
          type,
          project: fullProjectName,
          amount: numericAmount,
          server,
          platform,
          remark: remark.trim() || undefined,
          isTransferred,
          status,
        });

        onToast(`订单 ${formatNTEOrderNo(created.orderNo)} 创建成功！`);
        onSaved(created, true);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || '保存订单失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop with Soft Anime Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={requestClose}
            className="fixed inset-0 bg-[#4A4450]/40 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={isEditMode ? '编辑订单' : '新建订单'}
            className="relative w-full max-w-2xl bg-[#FFFCFB] border border-[#F4E9E4] rounded-3xl shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-[#F4E9E4] flex items-center justify-between shrink-0 bg-[#FFFCFB]/90 backdrop-blur-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FFF2F5] to-[#FFE5EC] border border-[#FFCCD7] flex items-center justify-center text-[#FF5277] shrink-0 shadow-[0_2px_8px_0_rgba(255,82,119,0.12)]">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-[#4A4450]">
                      {isEditMode ? '编辑订单' : '新建订单'}
                    </h3>
                    {isEditMode && existingOrderNo && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#FFF2F5] text-[#FF5277] border border-[#FFCCD7]">
                        {formatNTEOrderNo(existingOrderNo)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#635B69] mt-0.5 font-semibold">
                    {isEditMode
                      ? '修改客户需求或结算明细，实时计算实收'
                      : '录入客户与代练需求，实时核算订单收益'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={requestClose}
                disabled={isSubmitting}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#8F8795] hover:text-[#4A4450] hover:bg-[#FFF2F5] transition-colors cursor-pointer"
                aria-label="关闭窗口"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body with smooth scrolling */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3.5 bg-[#FFF2F5] border border-[#FFCCD7] rounded-2xl flex items-center gap-2.5 text-xs text-[#FF5277] shadow-xs"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">{errorMsg}</span>
                </motion.div>
              )}

              {isLoadingOrder ? (
                <div className="py-16 text-center text-xs text-[#8F8795]">
                  <div className="w-8 h-8 mx-auto mb-2 border-2 border-[#FF5277] border-t-transparent rounded-full animate-spin" />
                  <span>正在加载订单数据……</span>
                </div>
              ) : (
                <form id="order-form" onSubmit={handleSubmit} className="space-y-5">
                  {/* Section 1: 客户信息 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                      <User className="w-4 h-4 text-[#FF5277]" />
                      <h4 className="text-sm font-bold text-[#4A4450]">客户信息</h4>
                    </div>

                    <div className="bg-[#FFF8F5]/60 border border-[#F4E9E4] rounded-2xl p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-[#4A4450] mb-1.5">
                            客户姓名 / 昵称 <span className="text-[#FF5277]">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="例如：原神大佬、旅行者"
                            className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#F4E9E4] focus:border-[#FF5277] focus:bg-[#FFFFFF] rounded-2xl text-xs sm:text-sm text-[#4A4450] placeholder-[#B5ABB9] outline-none transition-[box-shadow,border-color,background-color] shadow-xs focus:ring-2 focus:ring-[#FFCCD7]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#4A4450] mb-1.5">
                            联系方式 (手机/微信/QQ)
                          </label>
                          <input
                            type="text"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="可选，例如：13800138000"
                            className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#F4E9E4] focus:border-[#FF5277] focus:bg-[#FFFFFF] rounded-2xl text-xs sm:text-sm text-[#4A4450] placeholder-[#B5ABB9] outline-none transition-[box-shadow,border-color,background-color] shadow-xs focus:ring-2 focus:ring-[#FFCCD7]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: 项目与代练类型 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                      <Gamepad2 className="w-4 h-4 text-[#9333EA]" />
                      <h4 className="text-sm font-bold text-[#4A4450]">项目与代练分类</h4>
                    </div>

                    <div className="bg-[#FFF8F5]/60 border border-[#F4E9E4] rounded-2xl p-4 space-y-3.5">
                      {/* 业务类型 (普通单 vs 托管) */}
                      <div>
                        <label className="block text-xs font-semibold text-[#4A4450] mb-1.5">
                          业务类型
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['standard', 'hosting'] as OrderType[]).map((t) => {
                            const isSelected = type === t;
                            return (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={`h-10 px-3 rounded-2xl text-xs sm:text-sm font-bold border transition-colors flex items-center justify-center cursor-pointer box-border ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-[#FF6B8B] to-[#FF5277] text-white border-transparent shadow-[0_2px_8px_0_rgba(255,82,119,0.32)]'
                                    : 'bg-[#FFFFFF] border-[#F4E9E4] text-[#554D5C] hover:bg-[#FFF2F5] hover:text-[#4A4450]'
                                }`}
                              >
                                <span>{ORDER_TYPE_LABELS[t]}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 二级项目联动选择 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Select
                            label="一级分类 (游戏/大类)"
                            options={parentOptions}
                            value={parentCategory}
                            onChange={handleParentCategoryChange}
                            icon={<Layers className="w-4 h-4 text-[#8F8795]" />}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <Select
                            label="二级细分需求"
                            options={childOptions}
                            value={childCategory}
                            onChange={(v) => setChildCategory(String(v))}
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* 服务器与来源平台 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Select
                            label="游戏服务器"
                            options={SERVER_FORM_OPTIONS}
                            value={server}
                            onChange={(v) => setServer(v as ServerType)}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#4A4450] mb-1.5">
                            获客来源平台
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {(['xianyu', 'wechat'] as PlatformType[]).map((p) => {
                              const isSelected = platform === p;
                              return (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => setPlatform(p)}
                                  className={`h-10 px-3 rounded-2xl text-xs sm:text-sm font-bold border transition-colors flex items-center justify-center cursor-pointer box-border ${
                                    isSelected
                                      ? p === 'xianyu'
                                        ? 'bg-gradient-to-r from-[#FF6B8B] to-[#FF5277] text-white border-transparent shadow-[0_2px_8px_0_rgba(255,82,119,0.32)]'
                                        : 'bg-gradient-to-r from-[#38A169] to-[#2F855A] text-white border-transparent shadow-[0_2px_8px_0_rgba(56,161,105,0.32)]'
                                      : 'bg-[#FFFFFF] border-[#F4E9E4] text-[#554D5C] hover:bg-[#FFF2F5] hover:text-[#4A4450]'
                                  }`}
                                >
                                  <span>{PLATFORM_LABELS[p]}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: 金额与结算 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                      <Coins className="w-4 h-4 text-[#FF5277]" />
                      <h4 className="text-sm font-bold text-[#4A4450]">金额与结算</h4>
                    </div>

                    <div className="bg-[#FFF8F5]/60 border border-[#F4E9E4] rounded-2xl p-4 space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-[#4A4450] mb-1.5">
                            订单总金额 (¥) <span className="text-[#FF5277]">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-[#8F8795]">
                              ¥
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              required
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="0.00"
                              className="w-full h-10 pl-8 pr-4 bg-[#FFFFFF] border border-[#F4E9E4] focus:border-[#FF5277] focus:bg-[#FFFFFF] rounded-2xl text-xs sm:text-sm font-extrabold text-[#4A4450] placeholder-[#B5ABB9] outline-none transition-[box-shadow,border-color,background-color] shadow-xs focus:ring-2 focus:ring-[#FFCCD7]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#4A4450] mb-1.5">
                            是否外包转单
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { label: '自打自营 (100%)', val: false },
                              { label: '外包转单 (80%)', val: true },
                            ].map((opt) => {
                              const isSelected = isTransferred === opt.val;
                              return (
                                <button
                                  key={String(opt.val)}
                                  type="button"
                                  onClick={() => setIsTransferred(opt.val)}
                                  className={`h-10 px-3 rounded-2xl text-xs sm:text-sm font-bold border transition-colors flex items-center justify-center cursor-pointer box-border ${
                                    isSelected
                                      ? 'bg-gradient-to-r from-[#FF6B8B] to-[#FF5277] text-white border-transparent shadow-[0_2px_8px_0_rgba(255,82,119,0.32)]'
                                      : 'bg-[#FFFFFF] border-[#F4E9E4] text-[#554D5C] hover:bg-[#FFF2F5] hover:text-[#4A4450]'
                                  }`}
                                >
                                  <span>{opt.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* 订单状态 */}
                      <div>
                        <Select
                          label="订单当前状态"
                          options={STATUS_FORM_OPTIONS}
                          value={status}
                          onChange={(v) => setStatus(v as OrderStatus)}
                          className="w-full"
                        />
                      </div>

                      {/* 备注 */}
                      <div>
                        <label className="block text-xs font-semibold text-[#4A4450] mb-1.5">
                          补充备注 / 排单细节
                        </label>
                        <textarea
                          rows={2}
                          value={remark}
                          onChange={(e) => setRemark(e.target.value)}
                          placeholder="记录账号注意事项、防封禁细节或特殊排单要求喵～"
                          className="w-full p-3 bg-[#FFFFFF] border border-[#F4E9E4] focus:border-[#FF5277] focus:bg-[#FFFFFF] rounded-2xl text-xs sm:text-sm text-[#4A4450] placeholder-[#B5ABB9] outline-none transition-[box-shadow,border-color,background-color] resize-none shadow-xs focus:ring-2 focus:ring-[#FFCCD7]"
                        />
                      </div>

                      {/* 实时结算小卡片 */}
                      <div className="pt-2 border-t border-[#F4E9E4]/60">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#4A4450]">
                            <Calculator className="w-4 h-4 text-[#FF5277]" />
                            <span>实时结算预览</span>
                          </div>
                          <span className="text-[11px] text-[#8F8795]">
                            {platform === 'xianyu'
                              ? '闲鱼提现扣费 1.6%'
                              : '微信 0% 手续费'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="bg-[#FFFFFF] border border-[#F4E9E4] p-2.5 rounded-xl text-center shadow-xs">
                            <span className="text-[11px] text-[#8F8795] block mb-0.5">
                              订单金额
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-[#4A4450]">
                              {formatCurrency(settlement.orderAmount)}
                            </span>
                          </div>

                          <div className="bg-[#FFFFFF] border border-[#F4E9E4] p-2.5 rounded-xl text-center shadow-xs">
                            <span className="text-[11px] text-[#8F8795] block mb-0.5">
                              转单支出 (80%)
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-[#FF5277]">
                              {isTransferred
                                ? `- ${formatCurrency(settlement.transferAmount)}`
                                : '¥0.00'}
                            </span>
                          </div>

                          <div className="bg-[#FFFFFF] border border-[#F4E9E4] p-2.5 rounded-xl text-center shadow-xs">
                            <span className="text-[11px] text-[#8F8795] block mb-0.5">
                              平台扣费 (1.6%)
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-[#8F8795]">
                              {settlement.platformFee > 0
                                ? `- ${formatCurrency(settlement.platformFee)}`
                                : '¥0.00'}
                            </span>
                          </div>

                          <div className="bg-[#EFFBF2] border border-[#CDEED5] p-2.5 rounded-xl text-center shadow-xs">
                            <span className="text-[11px] text-[#2E7D32] block font-bold mb-0.5">
                              预估实收净额
                            </span>
                            <span className="text-xs sm:text-sm font-black text-[#2E7D32]">
                              {formatCurrency(settlement.actualAmount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-[#F4E9E4] flex items-center justify-between bg-[#FFFCFB] shrink-0">
              <span className="text-[11px] text-[#8F8795] hidden sm:inline-block">
                按 <kbd className="px-1.5 py-0.5 rounded-md bg-[#FFF8F5] border border-[#F4E9E4] font-mono text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded-md bg-[#FFF8F5] border border-[#F4E9E4] font-mono text-[10px]">Enter</kbd> 快捷保存
              </span>

              <div className="flex items-center gap-3 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={requestClose}
                  disabled={isSubmitting}
                  className="rounded-full px-5 border-[#F4E9E4] text-[#8F8795] hover:text-[#4A4450] hover:bg-[#FFF8F5]"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  form="order-form"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  loadingText="正在保存……"
                  leftIcon={<Save className="w-4 h-4" />}
                  className="rounded-full px-6 font-bold shadow-xs"
                >
                  {isEditMode ? '保存修改' : '确认创建'}
                </Button>
              </div>
            </div>

            {/* Unsaved Changes Guard Dialog */}
            <AnimatePresence>
              {showUnsavedConfirm && (
                <div
                  className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-[#4A4450]/40 backdrop-blur-2xs"
                  onClick={() => setShowUnsavedConfirm(false)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    role="dialog"
                    aria-modal="true"
                    aria-label="未保存更改确认"
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-sm bg-[#FFFCFB] border border-[#FFCCD7] rounded-3xl p-5 shadow-2xl space-y-4 text-center"
                  >
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-[#FFF2F5] to-[#FFE5EC] border border-[#FFCCD7] flex items-center justify-center text-[#FF5277] shadow-xs">
                      <HelpCircle className="w-6 h-6" />
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-[#4A4450]">
                        表单内容尚未保存喵！
                      </h4>
                      <p className="text-xs text-[#635B69] mt-1 leading-relaxed">
                        现在退出将丢失您刚刚输入或修改的内容，确定要放弃本次编辑吗？
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowUnsavedConfirm(false)}
                        className="flex-1 rounded-full border-[#FFCCD7] text-[#FF5277] hover:bg-[#FFF2F5]"
                      >
                        继续编辑
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setShowUnsavedConfirm(false);
                          onClose();
                        }}
                        className="flex-1 rounded-full bg-[#635B69] hover:bg-[#4A4450] text-white"
                      >
                        放弃并退出
                      </Button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
