import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User as UserIcon, Lock, Sparkles, Heart, PawPrint } from 'lucide-react';
import { MewLogo } from '../brand/MewLogo';
import { FloatingDecorations } from '../brand/FloatingDecorations';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface LoginPageProps {
  onLoginSuccess: (username: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setError('🥺 账号或密码好像不对，再试一次吧～');
      return;
    }

    setIsLoading(true);

    // Simulate gentle loading as requested in spec ("🌸 正在准备你的小窝……")
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(trimmedUser);
    }, 1100);
  };

  const handleQuickFill = () => {
    setUsername('MewMaster');
    setPassword('meow123456');
    setError(null);
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between items-center px-4 py-8 overflow-x-hidden">
      {/* Ambient background decoration */}
      <FloatingDecorations />

      {/* Top subtle badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 mt-2 sm:mt-4 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFF0F3]/80 border border-[#FFD9E2] text-xs text-[#8F8795] shadow-sm backdrop-blur-xs"
      >
        <span className="text-[#FA94A6]">
          <Sparkles className="w-3.5 h-3.5" />
        </span>
        <span>个人轻量订单管理助手 · v1.0</span>
      </motion.div>

      {/* Main Login Center Container */}
      <main className="z-10 w-full max-w-md my-auto pt-4 pb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <Card className="px-6 py-8 sm:p-10 shadow-[0_16px_40px_rgba(255,182,193,0.15)] border-[#F5E6E0] backdrop-blur-sm bg-[#FFFCFB]/95">
            {/* 1. Mascot Logo */}
            <div className="flex flex-col items-center text-center mb-6">
              <motion.div
                animate={{ y: [-2, 2, -2] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="mb-3"
              >
                <MewLogo size="lg" />
              </motion.div>

              {/* 2. Product Name */}
              <h1 className="text-3xl font-extrabold text-[#4A4450] tracking-tight mt-1 mb-0.5">
                喵序
              </h1>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#8F8795] font-sans">
                MewFlow
              </span>

              {/* 3. Brand Slogan */}
              <div className="mt-3 inline-flex items-center gap-1.5 text-sm text-[#8F8795] bg-[#FFF8F5] px-3.5 py-1 rounded-full border border-[#EEDCD5]">
                <Sparkles className="w-3.5 h-3.5 text-[#FFB6C1]" />
                <span className="font-semibold text-[#4A4450]">让每一单，都井井有喵。</span>
              </div>
            </div>

            {/* 4. Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="账号"
                placeholder="输入你的账号喵～"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError(null);
                }}
                leftIcon={<UserIcon className="w-4 h-4" />}
                autoComplete="username"
                disabled={isLoading}
              />

              <Input
                label="密码"
                isPassword
                placeholder="输入密码喵～"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                leftIcon={<Lock className="w-4 h-4" />}
                autoComplete="current-password"
                disabled={isLoading}
                error={error || undefined}
              />

              {/* 5. Login Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isLoading}
                  loadingText="正在准备你的小窝……"
                  className="w-full text-base py-3.5 shadow-[0_6px_18px_rgba(255,82,119,0.35)] font-bold"
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  登录喵序
                </Button>
              </div>

              {/* Quick sample fill hint */}
              <div className="pt-2 flex items-center justify-between text-xs text-[#635B69] border-t border-[#F7ECE7]/80 mt-4">
                <span className="flex items-center gap-1 font-semibold">
                  <PawPrint className="w-3.5 h-3.5 text-[#E05368]" />
                  <span>输入任意账号密码即可体验</span>
                </span>
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="text-[#E05368] hover:text-[#C94054] font-bold hover:underline inline-flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-[#FFF0F3] transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  一键填入体验账号
                </button>
              </div>
            </form>
          </Card>
        </motion.div>
      </main>

      {/* Bottom Footer */}
      <footer className="z-10 text-center text-xs text-[#635B69] font-semibold pb-2 flex items-center gap-1.5 justify-center">
        <span>MewFlow · 一个认真帮你工作的订单小管家</span>
        <Heart className="w-3.5 h-3.5 text-[#FA94A6] fill-[#FA94A6]" />
      </footer>
    </div>
  );
};
