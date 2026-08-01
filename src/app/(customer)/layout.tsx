import Link from 'next/link'
import { 
  LayoutDashboard, ShoppingBag, Ruler, Palette, MapPin, 
  CreditCard, Heart, Star, HelpCircle, Settings, Gift, Bell, ShoppingCart 
} from 'lucide-react'

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#FDFDFD] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between flex-shrink-0 fixed h-full z-10 overflow-y-auto">
        <div>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
              <div className="text-[#7E153A]">
                <svg width="24" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20" />
                  <path d="M8 6h8" />
                  <path d="M12 22l-4-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-gray-900 leading-none">TailorLink<span className="text-[#7E153A]">.pk</span></h1>
                <p className="text-[8px] text-gray-500 uppercase tracking-widest mt-1">You Link it, We Stitch it</p>
              </div>
            </div>

            <Link href="/new-order">
              <button className="w-full bg-[#7E153A] hover:bg-[#630f2d] text-white rounded-md py-3 font-medium flex items-center justify-center gap-2 transition-colors shadow-sm mb-6">
                <span className="text-lg leading-none">+</span> New Order
              </button>
            </Link>

            <nav className="space-y-1">
              {[
                { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
                { icon: ShoppingBag, label: 'My Orders', href: '/orders' },
                { icon: Ruler, label: 'Measurements', href: '/measurements' },
                { icon: Palette, label: 'My Designs', href: '/designs' },
                { icon: MapPin, label: 'Address Book', href: '/address' },
                { icon: CreditCard, label: 'Payments', href: '/payments' },
                { icon: Heart, label: 'Wishlist', href: '/wishlist' },
                { icon: Star, label: 'Reviews', href: '/reviews' },
              ].map((item) => (
                <Link key={item.label} href={item.href} className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:text-[#7E153A] hover:bg-red-50 rounded-md transition-colors text-sm font-medium">
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="p-6">
            <nav className="space-y-1 mb-6 border-t border-gray-100 pt-6">
              <Link href="/help" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:text-[#7E153A] hover:bg-red-50 rounded-md transition-colors text-sm font-medium">
                <HelpCircle size={18} />
                Help & Support
              </Link>
              <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:text-[#7E153A] hover:bg-red-50 rounded-md transition-colors text-sm font-medium">
                <Settings size={18} />
                Settings
              </Link>
            </nav>

            <div className="bg-red-50 rounded-xl p-4 relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Refer & Earn</h4>
                <p className="text-xs text-gray-600 mb-3 leading-relaxed">Invite your friends and earn exciting rewards.</p>
                <button className="bg-[#7E153A] text-white text-xs font-medium px-4 py-2 rounded-md hover:bg-[#630f2d] transition-colors">
                  Invite Now
                </button>
              </div>
              <Gift size={48} className="absolute -bottom-2 -right-2 text-[#7E153A] opacity-20" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
          {/* Stepper (Only visible on new order flow, but put here for consistency or managed per page) */}
          <div className="flex-1" id="header-stepper">
            {/* The stepper logic can be injected here or put on the specific page */}
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-gray-500 hover:text-gray-900">
              <ShoppingCart size={20} />
              <span className="absolute -top-1 -right-1 bg-[#7E153A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">2</span>
            </button>
            <button className="relative text-gray-500 hover:text-gray-900">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                <img src="https://i.pravatar.cc/150?u=sarah" alt="User Avatar" className="object-cover w-full h-full" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 leading-none mb-1">Sarah Khan</p>
                <p className="text-[10px] text-gray-500 font-medium">Premium Member</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
