import { useState } from "react";
import {
  IconResumes,
  IconTemplates,
  IconSettings,
  IconAI,
} from "@/components/shared/icons/SidebarIcons";
import { usePathname, useRouter } from "@/lib/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Logo from "@/components/shared/Logo";
import { useLocale, useTranslations } from "@/i18n/compat/client";

interface MenuItem {
  title: string;
  url?: string;
  href?: string;
  icon: any;
  items?: { title: string; href: string }[];
}

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const t = useTranslations("dashboard");
  const sidebarItems: MenuItem[] = [
    {
      title: t("sidebar.resumes"),
      url: "/app/dashboard/resumes",
      icon: IconResumes,
    },
    {
      title: t("sidebar.templates"),
      url: "/app/dashboard/templates",
      icon: IconTemplates,
    },
    {
      title: t("sidebar.ai"),
      url: "/app/dashboard/ai",
      icon: IconAI,
    },
    {
      title: t("sidebar.settings"),
      url: "/app/dashboard/settings",
      icon: IconSettings,
    },
  ];

  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [open, setOpen] = useState(true);
  const [collapsible] = useState<"offcanvas" | "icon" | "none">("icon");

  const handleItemClick = (item: MenuItem) => {
    if (!item.items) {
      router.push(item.url || item.href || "/");
    }
  };

  const isItemActive = (item: MenuItem) => {
    if (item.items) {
      return item.items.some((subItem) => pathname === subItem.href);
    }
    return item.url === pathname || item.href === pathname;
  };

  return (
    <div className="flex h-screen bg-q_bone text-q_black">
      <SidebarProvider open={open} onOpenChange={setOpen}>
        <Sidebar
          collapsible={collapsible}
          className="border-r border-q_graphite/20 bg-q_bone/95 backdrop-blur-md"
        >
          <SidebarHeader className="h-16 flex items-center justify-center border-b border-q_graphite/20">
            <div
              className="w-full cursor-pointer justify-center flex items-center gap-2"
              onClick={() => router.push(`/${locale}`)}
            >
              <Logo className="hover:opacity-80 transition-opacity" size={30} />
              {open && (
                <span className="font-display font-semibold text-lg tracking-tight">
                  {t("sidebar.appName")}
                </span>
              )}
            </div>
          </SidebarHeader>
          <SidebarContent className="px-3 py-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {sidebarItems.map((item) => {
                    const active = isItemActive(item);
                    return (
                      <TooltipProvider delayDuration={0} key={item.title}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuItem key={item.title}>
                              <SidebarMenuButton
                                asChild
                                isActive={active}
                                className={`w-full transition-all duration-200 ease-in-out h-12 mb-1 [&>svg]:size-auto ${
                                  active
                                    ? "bg-q_acid/10 text-q_black font-semibold hover:bg-q_acid/20"
                                    : "text-q_graphite hover:bg-q_white hover:text-q_black"
                                }`}
                              >
                                <div
                                  className="flex items-center gap-2 px-2 cursor-pointer"
                                  onClick={() => handleItemClick(item)}
                                >
                                  <item.icon size={20} active={active} />
                                  {open && (
                                    <span className="flex-1 text-sm">{item.title}</span>
                                  )}
                                </div>
                              </SidebarMenuButton>
                              {item.items && open && (
                                <div className="ml-9 mt-1 space-y-1 border-l border-q_graphite/30 pl-2">
                                  {item.items.map((subItem) => (
                                    <div
                                      key={subItem.href}
                                      className={`cursor-pointer px-3 py-2 rounded-md text-sm transition-colors ${
                                        pathname === subItem.href
                                          ? "text-q_black font-medium bg-q_acid/10"
                                          : "text-q_graphite hover:text-q_black hover:bg-q_white"
                                      }`}
                                      onClick={() => router.push(subItem.href)}
                                    >
                                      {subItem.title}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </SidebarMenuItem>
                          </TooltipTrigger>
                          {!open && (
                            <TooltipContent side="right" className="font-medium">
                              {item.title}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter />
        </Sidebar>
        <main className="flex-1 flex flex-col">
          <div className="p-2 border-b border-q_graphite/10 bg-q_bone/80 backdrop-blur-sm">
            <SidebarTrigger className="hover:bg-q_white" />
          </div>
          <div className="flex-1">{children}</div>
        </main>
      </SidebarProvider>
    </div>
  );
};

export default DashboardLayout;
