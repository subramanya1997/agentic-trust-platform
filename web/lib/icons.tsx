/**
 * Icon utility - Centralized Hugeicons exports
 * Provides a Lucide-like interface for easier migration
 */

import {
  DashboardSpeed01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  MoreHorizontalIcon,
  Add01Icon,
  Edit01Icon,
  Edit02Icon,
  Delete01Icon,
  FloppyDiskIcon,
  Copy01Icon,
  CheckmarkCircle01Icon,
  CheckmarkCircle02Icon,
  Tick01Icon,
  Cancel01Icon,
  CircleIcon,
  Refresh01Icon,
  Loading03Icon,
  PlayIcon,
  PauseIcon,
  CancelCircleIcon,
  AlertCircleIcon,
  Triangle01Icon,
  Clock01Icon,
  RadioButtonIcon,
  Mail01Icon,
  File01Icon,
  CodeIcon,
  BookOpen01Icon,
  Attachment01Icon,
  SentIcon,
  Upload01Icon,
  Download01Icon,
  Link02Icon,
  LinkForwardIcon,
  Activity01Icon,
  BarChartIcon,
  ChartUpIcon,
  ChartDownIcon,
  MinusSignIcon,
  Dollar01Icon,
  CreditCardIcon,
  User02Icon,
  Shield01Icon,
  SecurityCheckIcon,
  LockIcon,
  Key01Icon,
  Infinity01Icon,
  ZapIcon,
  WebhookIcon,
  ServerStack01Icon,
  Settings01Icon,
  Building02Icon,
  HelpCircleIcon,
  Notification01Icon,
  Message01Icon,
  Github01Icon,
  Sun01Icon,
  Moon01Icon,
  Calendar01Icon,
  LayoutRightIcon,
  Search01Icon,
  AiMagicIcon,
  Rotate01Icon,
  LogoutCircle01Icon,
  ArrowUpDownIcon,
  CheckmarkSquare01Icon,
  Square01Icon,
  Timer01Icon,
  Wrench01Icon,
  EyeIcon,
  HeadphonesIcon,
  Video01Icon,
  ViewOffIcon,
  Audit01Icon,
  AiBrain01Icon,
  GlobeIcon,
  ApiIcon,
  PipelineIcon,
  FlowIcon,
  Analytics01Icon,
  FireIcon,
  ConsoleIcon,
  DatabaseIcon,
  RecordIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React from "react";
import type { IconSvgElement } from "@hugeicons/react";

// Icon component props matching Lucide's interface
export interface IconProps extends Omit<React.ComponentProps<typeof HugeiconsIcon>, "icon"> {
  size?: number | string;
  className?: string;
  strokeWidth?: number;
}

// Helper function to create icon components
function createIcon(icon: IconSvgElement) {
  const IconComponent = React.forwardRef<SVGSVGElement, IconProps>(
    ({ size = 16, className, strokeWidth = 1.5, ...props }, ref) => {
      return (
        <HugeiconsIcon
          ref={ref}
          icon={icon}
          size={size}
          className={className}
          strokeWidth={strokeWidth}
          {...props}
        />
      );
    }
  );
  IconComponent.displayName = `Icon`;
  return IconComponent;
}

// Create individual icon components matching Lucide names
export const LayoutDashboard = createIcon(DashboardSpeed01Icon);
export const Bot = createIcon(Infinity01Icon);
export const HelpCircle = createIcon(HelpCircleIcon);
export const Activity = createIcon(Activity01Icon);
export const BookOpen = createIcon(BookOpen01Icon);
export const Key = createIcon(Key01Icon);
export const Users = createIcon(User02Icon);
export const BarChart3 = createIcon(BarChartIcon);
export const Webhook = createIcon(WebhookIcon);
export const Building2 = createIcon(Building02Icon);
export const Zap = createIcon(ZapIcon);
export const ChevronRight = createIcon(ArrowRight01Icon);
export const ChevronLeft = createIcon(ArrowLeft01Icon);
export const ChevronDown = createIcon(ArrowDown01Icon);
export const ChevronUp = createIcon(ArrowUp01Icon);
export const ChevronsUpDown = createIcon(ArrowUpDownIcon);
export const LogOut = createIcon(LogoutCircle01Icon);
export const Shield = createIcon(Shield01Icon);
export const Check = createIcon(Tick01Icon);
export const CheckCircle = createIcon(CheckmarkCircle01Icon);
export const CheckCircle2 = createIcon(CheckmarkCircle02Icon);
export const RefreshCw = createIcon(Refresh01Icon);
export const X = createIcon(Cancel01Icon);
export const XCircle = createIcon(CancelCircleIcon);
export const Mail = createIcon(Mail01Icon);
export const Clock = createIcon(Clock01Icon);
export const Plus = createIcon(Add01Icon);
export const Settings = createIcon(Settings01Icon);
export const Copy = createIcon(Copy01Icon);
export const ExternalLink = createIcon(LinkForwardIcon);
export const Code = createIcon(CodeIcon);
export const Code2 = createIcon(CodeIcon);
export const TrendingUp = createIcon(ChartUpIcon);
export const TrendingDown = createIcon(ChartDownIcon);
export const Calendar = createIcon(Calendar01Icon);
export const Edit2 = createIcon(Edit02Icon);
export const Trash2 = createIcon(Delete01Icon);
export const Play = createIcon(PlayIcon);
export const Pause = createIcon(PauseIcon);
export const ArrowLeft = createIcon(ArrowLeft01Icon);
export const ArrowRight = createIcon(ArrowRight01Icon);
export const PanelRight = createIcon(LayoutRightIcon);
export const PanelRightClose = createIcon(LayoutRightIcon);
export const Loader2 = createIcon(Loading03Icon);
export const FileJson = createIcon(File01Icon);
export const FileText = createIcon(File01Icon);
export const Upload = createIcon(Upload01Icon);
export const Download = createIcon(Download01Icon);
export const Link2 = createIcon(Link02Icon);
export const Server = createIcon(ServerStack01Icon);
export const Gauge = createIcon(DashboardSpeed01Icon);
export const Bell = createIcon(Notification01Icon);
export const Sparkles = createIcon(AiMagicIcon);
export const RotateCcw = createIcon(Rotate01Icon);
export const Search = createIcon(Search01Icon);
export const CreditCard = createIcon(CreditCardIcon);
export const DollarSign = createIcon(Dollar01Icon);
export const ShieldCheck = createIcon(SecurityCheckIcon);
export const Sun = createIcon(Sun01Icon);
export const Moon = createIcon(Moon01Icon);
export const Circle = createIcon(CircleIcon);
export const CircleDot = createIcon(RadioButtonIcon);
export const AlertCircle = createIcon(AlertCircleIcon);
export const AlertTriangle = createIcon(Triangle01Icon);
export const Minus = createIcon(MinusSignIcon);
export const MoreHorizontal = createIcon(MoreHorizontalIcon);
export const Save = createIcon(FloppyDiskIcon);
export const Pencil = createIcon(Edit01Icon);
export const Github = createIcon(Github01Icon);
export const MessageSquare = createIcon(Message01Icon);
export const Paperclip = createIcon(Attachment01Icon);
export const Send = createIcon(SentIcon);
export const CheckSquare = createIcon(CheckmarkSquare01Icon);
export const Square = createIcon(Square01Icon);
export const User = createIcon(User02Icon);
export const Timer = createIcon(Timer01Icon);
export const Wrench = createIcon(Wrench01Icon);
export const Lock = createIcon(LockIcon);
export const Eye = createIcon(EyeIcon);
export const MessageCircle = createIcon(Message01Icon);
export const Headphones = createIcon(HeadphonesIcon);
export const Video = createIcon(Video01Icon);
export const EyeOff = createIcon(ViewOffIcon);
export const ScrollText = createIcon(Audit01Icon);
export const Brain = createIcon(AiBrain01Icon);
export const Globe = createIcon(GlobeIcon);

// New useful icons
export const Api = createIcon(ApiIcon);
export const Pipeline = createIcon(PipelineIcon);
export const Flow = createIcon(FlowIcon);
export const Analytics = createIcon(Analytics01Icon);
export const Audit = createIcon(Audit01Icon);
export const Fire = createIcon(FireIcon);
export const Console = createIcon(ConsoleIcon);
export const Database = createIcon(DatabaseIcon);
export const Notification = createIcon(Notification01Icon);
export const Record = createIcon(RecordIcon);
export const ArrowUp = createIcon(ArrowUp01Icon);

// Type for icon props (replaces LucideIcon)
export type LucideIcon = React.ComponentType<IconProps>;

// Custom MCP icon component
export function McpIcon({ className, size = 16 }: { className?: string; size?: number | string }) {
  return (
    <svg
      fill="currentColor"
      fillRule="evenodd"
      height={size}
      width={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 text-foreground ${className || ""}`}
      style={{ flexShrink: 0, lineHeight: 1 }}
    >
      <title>ModelContextProtocol</title>
      <path d="M15.688 2.343a2.588 2.588 0 00-3.61 0l-9.626 9.44a.863.863 0 01-1.203 0 .823.823 0 010-1.18l9.626-9.44a4.313 4.313 0 016.016 0 4.116 4.116 0 011.204 3.54 4.3 4.3 0 013.609 1.18l.05.05a4.115 4.115 0 010 5.9l-8.706 8.537a.274.274 0 000 .393l1.788 1.754a.823.823 0 010 1.18.863.863 0 01-1.203 0l-1.788-1.753a1.92 1.92 0 010-2.754l8.706-8.538a2.47 2.47 0 000-3.54l-.05-.049a2.588 2.588 0 00-3.607-.003l-7.172 7.034-.002.002-.098.097a.863.863 0 01-1.204 0 .823.823 0 010-1.18l7.273-7.133a2.47 2.47 0 00-.003-3.537z"></path>
      <path d="M14.485 4.703a.823.823 0 000-1.18.863.863 0 00-1.204 0l-7.119 6.982a4.115 4.115 0 000 5.9 4.314 4.314 0 006.016 0l7.12-6.982a.823.823 0 000-1.18.863.863 0 00-1.204 0l-7.119 6.982a2.588 2.588 0 01-3.61 0 2.47 2.47 0 010-3.54l7.12-6.982z"></path>
    </svg>
  );
}
