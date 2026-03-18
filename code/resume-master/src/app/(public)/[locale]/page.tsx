import { useEffect } from "react";
import {
  ArrowRight,
  Code2,
  Download,
  Info,
  LayoutGrid,
  Menu,
  Server,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import Logo from "@/components/shared/Logo";

const tickerItems = [
  "// 模块高度：自由可调",
  "// 头像区域：支持高度调节",
  "// 实时预览：编辑即生效",
  "// 导出 PDF：稳定排版",
  "// AI 辅助：润色与语法检查"
];

const featureCards = [
  {
    id: "01",
    title: "模块高度自由调节",
    desc: "每个简历模块都能独立设置高度，信息密度和留白由你自己掌控。"
  },
  {
    id: "02",
    title: "头像区域可调",
    desc: "头像容器不再锁死，支持上下拖拽与数值调节，适配不同版式。"
  },
  {
    id: "03",
    title: "网格化排版控制",
    desc: "按块管理标题、内容和间距，让一页简历在视觉上更加专业。"
  },
  {
    id: "04",
    title: "一键导出投递",
    desc: "导出为 PDF 后可直接投递，避免格式错位和打印偏移。"
  }
];

export default function LandingPage() {
  const dashboardPath = "/app/dashboard";

  useEffect(() => {
    const scope = document.querySelector(".yi-home");
    if (!scope) {
      return;
    }

    const revealElements = Array.from(
      scope.querySelectorAll<HTMLElement>(".reveal")
    );
    const counterElements = Array.from(
      scope.querySelectorAll<HTMLElement>(".counter")
    );
    const nav = scope.querySelector<HTMLElement>(".yi-nav");

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            entry.target
              .querySelectorAll(".draw-line, .draw-line-y")
              .forEach((line) => line.classList.add("active"));
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    revealElements.forEach((element) => revealObserver.observe(element));

    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const target = entry.target as HTMLElement;
          const finalValue = Number.parseFloat(
            target.getAttribute("data-target") || "0"
          );
          const decimals = Number.parseInt(
            target.getAttribute("data-decimals") || "2",
            10
          );
          const duration = 2000;
          const start = performance.now();

          const updateCounter = (currentTime: number) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = (finalValue * easeProgress).toFixed(decimals);
            target.innerText = currentVal;

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              target.innerText = finalValue.toFixed(decimals);
            }
          };

          requestAnimationFrame(updateCounter);
          observer.unobserve(target);
        });
      },
      { threshold: 0.5 }
    );

    counterElements.forEach((counter) => counterObserver.observe(counter));

    const handleScroll = () => {
      if (!nav) {
        return;
      }

      if (window.scrollY > 50) {
        nav.classList.add("bg-q_bone", "border-q_graphite/20");
        nav.classList.remove("bg-q_bone/90", "border-transparent");
      } else {
        nav.classList.add("bg-q_bone/90", "border-transparent");
        nav.classList.remove("bg-q_bone", "border-q_graphite/20");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      revealObserver.disconnect();
      counterObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <main className="yi-home bg-q_bone text-q_black font-body antialiased selection:bg-q_acid selection:text-q_white overflow-x-hidden">
      <div className="bg-noise" />

      <nav className="yi-nav fixed top-0 left-0 w-full z-40 bg-q_bone/90 backdrop-blur-md border-b border-transparent transition-all duration-300">
        <div className="max-w-[clamp(70rem,95vw,100rem)] mx-auto px-[clamp(1.5rem,5vw,4rem)] h-20 flex items-center justify-between">
          <a
            href="#"
            className="font-display font-semibold text-[clamp(1.25rem,2vw,1.5rem)] track-tighter flex items-center gap-2 group"
          >
            <Logo size={28} className="group-hover:opacity-90 transition-opacity" />
            一页简历
          </a>

          <div className="hidden md:flex items-center gap-8 font-mono text-xs uppercase track-widest text-q_graphite">
            <a href="#thesis" className="hover:text-q_black transition-colors">
              理念
            </a>
            <a href="#performance" className="hover:text-q_black transition-colors">
              指标
            </a>
            <a href="#allocation" className="hover:text-q_black transition-colors">
              功能
            </a>
            <a href="#insights" className="hover:text-q_black transition-colors">
              说明
            </a>
          </div>

          <a
            href="#onboarding"
            className="hidden sm:inline-block relative px-[clamp(1.5rem,3vw,2rem)] py-[clamp(0.75rem,2vw,1rem)] font-mono font-medium text-xs uppercase track-widest text-q_bone bg-q_black clip-button overflow-hidden transition-all duration-300 hover:bg-q_acid"
          >
            立即开始
          </a>

          <button className="md:hidden text-q_black" aria-label="open menu">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-tech-grid opacity-50 z-0 pointer-events-none" />
        <svg
          className="absolute inset-0 w-full h-full z-0 opacity-20 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="20%"
            cy="30%"
            r="2"
            fill="#5C5C5C"
            className="grid-node"
            style={{ animationDelay: "0s" }}
          />
          <circle
            cx="80%"
            cy="40%"
            r="2"
            fill="#5C5C5C"
            className="grid-node"
            style={{ animationDelay: "1s" }}
          />
          <circle
            cx="60%"
            cy="70%"
            r="2"
            fill="#5C5C5C"
            className="grid-node"
            style={{ animationDelay: "2s" }}
          />
          <line
            x1="20%"
            y1="30%"
            x2="80%"
            y2="40%"
            stroke="#5C5C5C"
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />
          <line
            x1="80%"
            y1="40%"
            x2="60%"
            y2="70%"
            stroke="#5C5C5C"
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />
        </svg>

        <div className="max-w-[clamp(70rem,95vw,100rem)] mx-auto px-[clamp(1.5rem,5vw,4rem)] w-full relative z-10 grid grid-cols-12 gap-[clamp(1.5rem,3vw,2.5rem)]">
          <div className="col-span-12 lg:col-span-8 reveal">
            <h1 className="font-display font-semibold text-[clamp(2.6rem,6vw,5rem)] leading-[1.02] text-q_black mb-[clamp(1.5rem,3vw,2.5rem)]">
              一页简历<br />
              更强表达。<br />
              <span className="text-q_graphite">每个模块高度都可控。</span>
            </h1>

            <p className="font-body text-[clamp(1rem,1.2vw,1.125rem)] leading-relaxed text-q_graphite max-w-[55ch] mb-[clamp(2.5rem,5vw,4rem)]">
              一页简历是一款本地优先的 AI 简历编辑器，支持模块级高度调节、头像区域高度调节、实时预览与高质量导出，让你的简历更有秩序感。
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <a
                href="#onboarding"
                className="relative px-[clamp(1.5rem,3vw,2rem)] py-[clamp(0.75rem,2vw,1rem)] font-mono font-medium text-sm md:text-base uppercase track-widest text-q_bone bg-q_acid clip-button overflow-hidden transition-all duration-300 hover:bg-q_black hover:-translate-y-1"
              >
                开始制作
              </a>
              <a
                href="#allocation"
                className="font-mono text-xs uppercase track-widest text-q_black border-b border-q_black pb-1 hover:text-q_acid hover:border-q_acid transition-colors duration-300"
              >
                查看核心能力
              </a>
            </div>

            <div className="mt-[clamp(3rem,6vw,5rem)] flex items-center gap-4 border-t border-q_graphite/20 pt-6">
              <ShieldCheck className="text-q_acid h-6 w-6" />
              <p className="font-mono text-xs uppercase track-widest text-q_graphite">
                隐私优先，本地存储，无需注册
              </p>
            </div>
          </div>

          <div className="hidden lg:flex col-span-4 flex-col justify-end pb-12 reveal" style={{ transitionDelay: "0.2s" }}>
            <div className="border-l border-q_graphite/20 pl-8 space-y-8">
              <div>
                <div className="font-mono text-xs uppercase track-widest text-q_graphite mb-2">
                  简历完成效率提升
                </div>
                <div className="font-display font-semibold text-[clamp(2rem,3vw,3rem)] track-tighter text-q_acid flex items-baseline gap-1">
                  +<span className="counter" data-target="68.5">0.00</span>%
                  <span className="w-2 h-2 rounded-full bg-q_acid animate-pulse mb-4" />
                </div>
              </div>
              <div>
                <div className="font-mono text-xs uppercase track-widest text-q_graphite mb-2">
                  编辑状态
                </div>
                <div className="font-mono text-sm text-q_black flex items-center gap-2">
                  <Server className="h-4 w-4 text-q_acid" />
                  模块引擎已启动
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full bg-q_black border-y border-q_graphite/30 overflow-hidden py-3">
        <div className="marquee-container font-mono text-xs uppercase track-widest text-q_bone">
          <div className="flex-shrink-0 flex items-center gap-12 px-6">
            {[...tickerItems, ...tickerItems].map((item, idx) => (
              <span key={`${item}-${idx}`}>{item}</span>
            ))}
          </div>
        </div>
      </div>

      <section id="thesis" className="py-[clamp(5rem,10vw,10rem)] relative">
        <div className="max-w-[clamp(70rem,95vw,100rem)] mx-auto px-[clamp(1.5rem,5vw,4rem)] grid grid-cols-12 gap-[clamp(1.5rem,3vw,2.5rem)] relative">
          <div className="absolute left-[clamp(1.5rem,5vw,4rem)] top-0 bottom-0 w-[1px] bg-q_graphite/20 hidden lg:block">
            <div className="w-full bg-q_acid draw-line-y" />
          </div>

          <div className="col-span-12 lg:col-span-4 lg:pl-12 reveal">
            <div className="font-mono text-[10px] md:text-xs uppercase track-widest text-q_graphite mb-6 flex items-center gap-4 before:content-[''] before:w-8 before:h-[1px] before:bg-q_acid">
              [SEC.01_THESIS]
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8 reveal" style={{ transitionDelay: "0.1s" }}>
            <h2 className="font-display font-semibold text-[clamp(2rem,5vw,4rem)] leading-[1.15] text-q_black mb-[clamp(1.5rem,3vw,2.5rem)] max-w-[20ch]">
              固定模板不够用，<br />
              你的简历需要更细颗粒度控制。
            </h2>
            <div className="w-full h-[1px] bg-q_graphite/20 mb-[clamp(1.5rem,3vw,2.5rem)]">
              <div className="h-full bg-q_graphite draw-line" />
            </div>
            <p className="font-body text-[clamp(1rem,1.2vw,1.125rem)] leading-relaxed text-q_graphite max-w-[55ch]">
              一页简历把“内容编辑”和“视觉编排”解耦，你可以独立控制每个模块高度，包括头像区域，不再被单一布局限制。
            </p>
          </div>
        </div>
      </section>

      <section
        id="infrastructure"
        className="py-[clamp(5rem,10vw,10rem)] bg-q_white border-y border-q_graphite/20 overflow-hidden relative group"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-q_bone/50 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />

        <div className="max-w-[clamp(70rem,95vw,100rem)] mx-auto pl-[clamp(1.5rem,5vw,4rem)] grid grid-cols-12 items-center relative z-10">
          <div className="col-span-12 lg:col-span-4 pr-[clamp(1.5rem,5vw,4rem)] pb-12 lg:pb-0 reveal">
            <div className="font-mono text-[10px] md:text-xs uppercase track-widest text-q_graphite mb-6 flex items-center gap-4 before:content-[''] before:w-8 before:h-[1px] before:bg-q_acid">
              [SEC.02_EDITOR]
            </div>
            <h2 className="font-display font-semibold text-[clamp(2rem,4vw,3.5rem)] leading-[1.15] text-q_black mb-6">
              模块级可视化排版。
            </h2>
            <p className="font-body text-[clamp(1rem,1.2vw,1.125rem)] leading-relaxed text-q_graphite mb-8">
              在同一界面里管理模块顺序、区块高度、头像区域和文本密度，实时看到最终投递效果。
            </p>
            <div className="flex items-center gap-4 font-mono text-xs uppercase track-widest text-q_black">
              <Code2 className="text-q_acid h-5 w-5" />
              控件式编辑体验
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8 reveal" style={{ transitionDelay: "0.2s" }}>
            <div className="bg-q_bone border-t border-l border-q_graphite/20 p-8 shadow-2xl translate-x-[5%] lg:translate-x-0 relative">
              <div className="flex justify-between items-center mb-8 border-b border-q_graphite/20 pb-4">
                <div className="font-mono text-xs text-q_black uppercase track-widest">
                  Editor / Layout Control
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-q_graphite rounded-full" />
                  <div className="w-3 h-3 bg-q_graphite rounded-full" />
                  <div className="w-3 h-3 bg-q_acid rounded-full" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-q_white border border-q_graphite/20 p-6">
                  <div className="font-mono text-[10px] text-q_graphite uppercase track-widest mb-4">
                    模块高度控制
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-q_black/90 rounded-sm" />
                    <div className="h-8 bg-q_black/70 rounded-sm" />
                    <div className="h-12 bg-q_acid/80 rounded-sm" />
                    <div className="h-6 bg-q_black/60 rounded-sm" />
                  </div>
                </div>

                <div className="bg-q_white border border-q_graphite/20 p-6 flex flex-col justify-between">
                  <div className="font-mono text-[10px] text-q_graphite uppercase track-widest mb-2">
                    头像区域高度
                  </div>
                  <div className="font-display font-medium text-3xl text-q_black">
                    +<span className="counter" data-target="32" data-decimals="0">0</span>px
                  </div>
                  <div className="w-full mt-4 h-3 rounded-full bg-q_graphite/20">
                    <div className="h-full w-2/3 rounded-full bg-q_acid" />
                  </div>
                </div>

                <div className="col-span-2 bg-q_white border border-q_graphite/20 p-6">
                  <div className="font-mono text-[10px] text-q_graphite uppercase track-widest mb-4 border-b border-q_graphite/20 pb-2 flex justify-between">
                    <span>模块</span>
                    <span>高度</span>
                    <span>状态</span>
                  </div>
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-q_black">头像</span>
                      <span className="text-q_graphite">148px</span>
                      <span className="text-q_acid">可调</span>
                    </div>
                    <div className="w-full h-[1px] bg-q_graphite/10" />
                    <div className="flex justify-between items-center">
                      <span className="text-q_black">工作经历</span>
                      <span className="text-q_graphite">auto / fixed</span>
                      <span className="text-q_black">可调</span>
                    </div>
                    <div className="w-full h-[1px] bg-q_graphite/10" />
                    <div className="flex justify-between items-center">
                      <span className="text-q_black">项目经历</span>
                      <span className="text-q_graphite">220px</span>
                      <span className="text-q_acid">可调</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="performance" className="py-[clamp(5rem,10vw,10rem)] bg-q_bone">
        <div className="max-w-[clamp(70rem,95vw,100rem)] mx-auto px-[clamp(1.5rem,5vw,4rem)]">
          <div className="mb-[clamp(3rem,6vw,6rem)] max-w-[65ch] reveal">
            <div className="font-mono text-[10px] md:text-xs uppercase track-widest text-q_graphite mb-6 flex items-center gap-4 before:content-[''] before:w-8 before:h-[1px] before:bg-q_acid">
              [SEC.03_METRICS]
            </div>
            <h2 className="font-display font-semibold text-[clamp(2rem,4vw,3.5rem)] leading-[1.15] text-q_black mb-4">
              更快完成，更稳投递。
            </h2>
            <p className="font-body text-[clamp(1rem,1.2vw,1.125rem)] text-q_graphite">
              模块控制能力越强，简历质量越稳定。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-q_graphite/20 reveal" style={{ transitionDelay: "0.2s" }}>
            <div className="border-b border-r border-q_graphite/20 bg-q_white p-[clamp(2rem,4vw,3.5rem)] hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-q_acid hover:relative hover:z-10 transition-all duration-500 ease-swiss group card">
              <div className="font-display font-medium text-[clamp(3rem,5vw,4.5rem)] track-tighter text-q_black mb-2 flex items-baseline">
                <span className="counter" data-target="89.6">0.0</span>%
              </div>
              <div className="w-12 h-[1px] bg-q_graphite/50 mb-4 group-hover:bg-q_acid transition-colors duration-300" />
              <div className="font-mono text-xs uppercase track-widest text-q_graphite group-hover:text-q_black transition-colors duration-300">
                页面可控性评分
              </div>
            </div>

            <div className="border-b border-r border-q_graphite/20 bg-q_white p-[clamp(2rem,4vw,3.5rem)] hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-q_acid hover:relative hover:z-10 transition-all duration-500 ease-swiss group card">
              <div className="font-display font-medium text-[clamp(3rem,5vw,4.5rem)] track-tighter text-q_black mb-2 flex items-baseline">
                <span className="counter" data-target="1.9">0.0</span>x
              </div>
              <div className="w-12 h-[1px] bg-q_graphite/50 mb-4 group-hover:bg-q_acid transition-colors duration-300" />
              <div className="font-mono text-xs uppercase track-widest text-q_graphite group-hover:text-q_black transition-colors duration-300">
                编辑效率提升
              </div>
            </div>

            <div className="border-b border-r border-q_graphite/20 bg-q_white p-[clamp(2rem,4vw,3.5rem)] hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-q_acid hover:relative hover:z-10 transition-all duration-500 ease-swiss group card">
              <div className="font-display font-medium text-[clamp(3rem,5vw,4.5rem)] track-tighter text-q_black mb-2 flex items-baseline">
                <span className="counter" data-target="12" data-decimals="0">0</span>+
              </div>
              <div className="w-12 h-[1px] bg-q_graphite/50 mb-4 group-hover:bg-q_acid transition-colors duration-300" />
              <div className="font-mono text-xs uppercase track-widest text-q_graphite group-hover:text-q_black transition-colors duration-300">
                关键模块可精调
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="allocation" className="py-[clamp(5rem,10vw,10rem)]">
        <div className="max-w-[clamp(70rem,95vw,100rem)] mx-auto px-[clamp(1.5rem,5vw,4rem)]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-[clamp(3rem,6vw,6rem)] reveal">
            <div>
              <div className="font-mono text-[10px] md:text-xs uppercase track-widest text-q_graphite mb-6 flex items-center gap-4 before:content-[''] before:w-8 before:h-[1px] before:bg-q_acid">
                [SEC.04_FEATURES]
              </div>
              <h2 className="font-display font-semibold text-[clamp(2rem,4vw,3.5rem)] leading-[1.15] text-q_black mb-4">
                你真正能用上的功能。
              </h2>
              <p className="font-body text-[clamp(1rem,1.2vw,1.125rem)] text-q_graphite max-w-[50ch]">
                保留高级视觉风格，同时确保所有操作都围绕“更快、更准、更好投递”。
              </p>
            </div>
            <LayoutGrid className="text-4xl text-q_graphite/50" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[clamp(1.5rem,3vw,2.5rem)]">
            {featureCards.map((feature, index) => (
              <div
                key={feature.id}
                className="border border-q_graphite/20 bg-q_white p-[clamp(2rem,4vw,3.5rem)] hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-q_acid transition-all duration-400 ease-swiss group card reveal"
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <div className="flex justify-between items-start mb-16">
                  <div className="font-mono text-xs uppercase track-widest text-q_graphite group-hover:text-q_acid transition-colors">
                    {feature.id}.
                  </div>
                  <Sparkles className="h-6 w-6 text-q_black" />
                </div>
                <h3 className="font-display font-medium text-2xl text-q_black mb-4">
                  {feature.title}
                </h3>
                <p className="font-body text-q_graphite text-sm md:text-base leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="insights"
        className="py-[clamp(5rem,10vw,10rem)] bg-q_black text-q_white relative overflow-hidden dark-section"
      >
        <div className="bg-noise absolute inset-0" />

        <div className="max-w-[clamp(70rem,95vw,100rem)] mx-auto px-[clamp(1.5rem,5vw,4rem)] relative z-10 grid grid-cols-12">
          <div className="col-span-12 lg:col-span-8 lg:col-start-3 text-center flex flex-col items-center reveal">
            <div className="font-mono text-[10px] md:text-xs uppercase track-widest text-q_graphite mb-8 flex items-center justify-center gap-4 before:content-[''] before:w-8 before:h-[1px] before:bg-q_white after:content-[''] after:w-8 after:h-[1px] after:bg-q_white">
              使用说明
            </div>

            <h2 className="font-display font-semibold text-[clamp(2rem,5vw,4.5rem)] leading-[1.12] mb-6">
              下载你的简历并直接投递。
            </h2>

            <p className="font-body text-[clamp(1rem,1.2vw,1.125rem)] text-q_graphite max-w-[55ch] mb-12">
              完成排版后，一键导出 PDF。无需来回调格式，直接发送给 HR。
            </p>

            <a
              href={dashboardPath}
              className="relative px-[clamp(1.5rem,3vw,2rem)] py-[clamp(0.75rem,2vw,1rem)] font-mono font-medium text-sm md:text-base uppercase track-widest text-q_black bg-q_white clip-button overflow-hidden transition-all duration-300 hover:bg-q_acid hover:text-q_white"
            >
              <span className="relative z-10 flex items-center gap-3">
                进入工作台
                <Download className="h-4 w-4" />
              </span>
            </a>
          </div>
        </div>
      </section>

      <section id="onboarding" className="py-[clamp(8rem,15vw,15rem)] relative overflow-hidden">
        <div
          className="absolute inset-0 bg-tech-grid opacity-70 z-0 pointer-events-none"
          style={{ backgroundSize: "20px 20px" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-q_bone/50 to-q_bone z-0" />

        <div className="max-w-[clamp(70rem,95vw,100rem)] mx-auto px-[clamp(1.5rem,5vw,4rem)] relative z-10 text-center flex flex-col items-center reveal">
          <h2 className="font-display font-semibold text-[clamp(2.2rem,6vw,4.8rem)] leading-[1.08] text-q_black mb-6">
            现在开始<br />
            打造你的 <span className="text-q_acid">一页简历</span>
          </h2>

          <p className="font-body text-[clamp(1rem,1.2vw,1.25rem)] text-q_graphite max-w-[50ch] mb-10">
            控制每一个模块的高度和节奏，让你的简历看起来专业、克制、可读。
          </p>

          <a
            href={dashboardPath}
            className="relative px-[clamp(2rem,4vw,3rem)] py-[clamp(1rem,2vw,1.5rem)] font-mono font-semibold text-sm md:text-lg uppercase track-widest text-q_bone bg-q_black clip-button overflow-hidden transition-all duration-300 hover:bg-q_acid hover:scale-105 active:scale-95 shadow-2xl shadow-q_acid/20"
          >
            <span className="relative z-10 flex items-center gap-3">
              进入编辑器
              <ArrowRight className="h-5 w-5" />
            </span>
          </a>

          <div className="mt-8 font-mono text-[10px] uppercase track-widest text-q_graphite flex items-center gap-2">
            <Info className="h-4 w-4" />
            模块高度与头像高度均支持独立调整
          </div>
        </div>
      </section>

      <footer className="border-t border-q_graphite/20 bg-q_bone pt-20 relative overflow-hidden">
        <div className="max-w-[clamp(70rem,95vw,100rem)] mx-auto px-[clamp(1.5rem,5vw,4rem)] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-32 relative z-10">
          <div className="space-y-6">
            <a href="#" className="font-display font-semibold text-2xl flex items-center gap-2">
              <Logo size={24} />
              一页简历
            </a>
            <p className="font-mono text-xs uppercase track-widest text-q_graphite max-w-[240px]">
              模块可控，排版可控，结果可控。
            </p>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase track-widest text-q_black mb-6">功能</h4>
            <ul className="space-y-4 font-body text-sm text-q_graphite">
              <li>模块高度调节</li>
              <li>头像区域调节</li>
              <li>模块拖拽排序</li>
              <li>PDF 导出</li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase track-widest text-q_black mb-6">产品</h4>
            <ul className="space-y-4 font-body text-sm text-q_graphite">
              <li>工作台</li>
              <li>模板</li>
              <li>通用设置</li>
              <li>AI 辅助</li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase track-widest text-q_black mb-6">提示</h4>
            <p className="font-body text-sm text-q_graphite mb-4">
              建议使用最新版 Chrome 或 Edge，以获得最佳排版与导出体验。
            </p>
            <a
              href={dashboardPath}
              className="inline-flex items-center gap-2 font-mono text-xs uppercase track-widest text-q_black hover:text-q_acid transition-colors"
            >
              现在开始
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="relative z-10 border-t border-q_graphite/10 py-6 text-center font-mono text-[10px] uppercase track-widest text-q_graphite">
          © 一页简历 {new Date().getFullYear()}.
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/4 w-full text-center overflow-hidden pointer-events-none z-0">
          <h1 className="font-display font-semibold text-[clamp(10rem,25vw,30rem)] leading-none track-tighter text-q_graphite opacity-5 select-none m-0 p-0">
            ONEPAGE
          </h1>
        </div>
      </footer>
    </main>
  );
}

