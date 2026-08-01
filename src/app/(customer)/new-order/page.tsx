'use client'

import { useState } from 'react'
import { Link2, ShieldCheck, Scissors, Truck, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function NewOrderPage() {
  const [activeTab, setActiveTab] = useState('shirt')
  const [stitchingType, setStitchingType] = useState('standard')

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Specific Stepper replacing the layout placeholder conceptually */}
      <div className="flex items-center gap-4 text-sm font-medium text-gray-400 mb-8 max-w-3xl mx-auto justify-between px-12">
        <div className="flex items-center gap-2 text-[#7E153A]">
          <div className="w-6 h-6 rounded-full bg-[#7E153A] text-white flex items-center justify-center text-xs">1</div>
          <span>Product & Measurements</span>
        </div>
        <div className="h-px bg-gray-200 w-12"></div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-xs">2</div>
          <span>Customize</span>
        </div>
        <div className="h-px bg-gray-200 w-12"></div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-xs">3</div>
          <span>Review & Payment</span>
        </div>
        <div className="h-px bg-gray-200 w-12"></div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-xs">4</div>
          <span>Order Confirmed</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column - Product Details */}
        <div className="w-full lg:w-5/12 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">1. Product Details</h2>
            <p className="text-sm text-gray-500 mb-6">Paste product link and select your preferred options</p>

            <div className="space-y-2 mb-6">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Product Link</label>
              <div className="relative">
                <Input 
                  defaultValue="https://www.sanasafinaz.com/pk/mahay-lawn-3-piece-unstitched" 
                  className="pr-10 h-12 bg-gray-50 border-gray-200" 
                  readOnly
                />
                <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-green-600 font-medium flex items-center gap-1">✓ Product link is valid</span>
                <button className="text-xs text-[#7E153A] font-medium hover:underline">Change Product</button>
              </div>
            </div>

            {/* Product Card */}
            <div className="flex gap-4 mb-6">
              <div className="w-32 h-40 bg-gray-200 rounded-lg overflow-hidden relative flex-shrink-0">
                <img src="/login_bg.jpg" alt="Sana Safinaz" className="object-cover w-full h-full" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-xs text-gray-500 font-medium">Sana Safinaz</p>
                <h3 className="font-bold text-gray-900 text-base leading-tight mb-2">Mahay Lawn 3 Piece Unstitched</h3>
                <p className="text-[#7E153A] font-bold mb-3">PKR 4,850</p>
                <div className="space-y-1 text-xs text-gray-600">
                  <p><span className="text-gray-400 mr-2">Brand:</span> Sana Safinaz</p>
                  <p><span className="text-gray-400 mr-2">Collection:</span> Mahay Lawn</p>
                  <p><span className="text-gray-400 mr-2">Type:</span> 3 Piece Unstitched</p>
                  <p><span className="text-gray-400 mr-2">Fabric:</span> Lawn</p>
                </div>
                <button className="mt-3 text-xs font-medium text-blue-600 flex items-center gap-1 hover:underline">
                  View Full Details ↗
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-700">
              <p className="font-semibold mb-1">What's Included?</p>
              <p>Shirt (3.25m) + Dupatta (2.5m) + Trouser (2.5m)</p>
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-900 mb-3">Stitching Type</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div 
                  onClick={() => setStitchingType('standard')}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${stitchingType === 'standard' ? 'border-[#7E153A] bg-red-50/30 ring-1 ring-[#7E153A]' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="mb-2 text-gray-700"><Scissors size={20} /></div>
                  <h4 className="font-semibold text-sm mb-1 text-gray-900">Standard Stitching</h4>
                  <p className="text-[#7E153A] font-bold text-sm mb-2">PKR 2,000</p>
                  <p className="text-[10px] text-gray-500 leading-snug">Perfect everyday stitching</p>
                </div>
                <div 
                  onClick={() => setStitchingType('premium')}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${stitchingType === 'premium' ? 'border-[#7E153A] bg-red-50/30 ring-1 ring-[#7E153A]' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="mb-2 text-gray-700"><Scissors size={20} /></div>
                  <h4 className="font-semibold text-sm mb-1 text-gray-900">Premium Stitching</h4>
                  <p className="text-[#7E153A] font-bold text-sm mb-2">PKR 3,000</p>
                  <p className="text-[10px] text-gray-500 leading-snug">High quality finishing</p>
                </div>
                <div 
                  onClick={() => setStitchingType('luxury')}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${stitchingType === 'luxury' ? 'border-[#7E153A] bg-red-50/30 ring-1 ring-[#7E153A]' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="mb-2 text-gray-700"><Scissors size={20} /></div>
                  <h4 className="font-semibold text-sm mb-1 text-gray-900">Luxury Stitching</h4>
                  <p className="text-[#7E153A] font-bold text-sm mb-2">PKR 4,000</p>
                  <p className="text-[10px] text-gray-500 leading-snug">Designer level finishing</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-4 flex items-center gap-3 text-sm text-indigo-900 font-medium">
              <Truck size={18} className="text-indigo-600" />
              Estimated Delivery: 5 - 7 Working Days
            </div>
          </div>
        </div>

        {/* Right Column - Measurements Studio */}
        <div className="w-full lg:w-7/12 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">2. Measurements</h2>
                <p className="text-sm text-gray-500">Enter your measurements in inches</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="h-9 text-xs text-[#7E153A] border-red-100 hover:bg-red-50">
                  How to Measure?
                </Button>
                <Button variant="outline" className="h-9 text-xs">
                  Size Chart
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-50 p-1 rounded-lg mb-6 w-max">
              <button 
                onClick={() => setActiveTab('shirt')}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'shirt' ? 'bg-white text-[#7E153A] shadow-sm ring-1 ring-gray-200/50' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Shirt / Kameez
              </button>
              <button 
                onClick={() => setActiveTab('trouser')}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'trouser' ? 'bg-white text-[#7E153A] shadow-sm ring-1 ring-gray-200/50' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Trouser / Bottom
              </button>
              <button 
                onClick={() => setActiveTab('dupatta')}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'dupatta' ? 'bg-white text-[#7E153A] shadow-sm ring-1 ring-gray-200/50' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Dupatta
              </button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-8 mb-8 border border-gray-100 rounded-xl p-6">
              {/* Measurements Grid */}
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 mb-4 border-b pb-2">Upper Body</h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { label: 'Shoulder', val: '14' },
                    { label: 'Arm Hole', val: '8.5' },
                    { label: 'Bust', val: '38' },
                    { label: 'Sleeve Length', val: '22' },
                    { label: 'Waist', val: '32' },
                    { label: 'Chest', val: '36' },
                    { label: 'Hip', val: '40' },
                    { label: 'Shirt Length', val: '44' },
                  ].map(m => (
                    <div key={m.label}>
                      <label className="text-xs text-gray-600 mb-1.5 block">{m.label}</label>
                      <Input defaultValue={m.val} className="h-10 text-sm focus-visible:ring-[#7E153A]" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Body Diagram */}
              <div className="w-64 flex flex-col items-center justify-center relative bg-gray-50 rounded-xl p-4">
                <div className="w-full aspect-[1/2] bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                  {/* Placeholder for Female Body SVG Silhouette */}
                  [Female Body SVG Diagram]
                </div>
                {/* Numbered legend mock */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 space-y-2 hidden sm:block">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className="w-5 h-5 bg-[#7E153A] text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-md">
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Preferences */}
            <div className="mb-8">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Additional Preferences</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-xs text-gray-600 mb-1.5 block">Neck Style</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7E153A] focus-visible:ring-offset-2">
                    <option>Round Neck</option>
                    <option>V-Neck</option>
                    <option>Ban Collar</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1.5 block">Sleeve Style</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7E153A] focus-visible:ring-offset-2">
                    <option>Full Sleeve</option>
                    <option>3/4 Sleeve</option>
                    <option>Half Sleeve</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1.5 block">Fit</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7E153A] focus-visible:ring-offset-2">
                    <option>Regular Fit</option>
                    <option>Loose Fit</option>
                    <option>Slim Fit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600 mb-1.5 block">Other Instructions (Optional)</label>
                <textarea 
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7E153A] h-20 resize-none"
                  placeholder="Any specific instructions for stitching..."
                ></textarea>
                <div className="text-right text-[10px] text-gray-400 mt-1">0/300</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-auto pt-6 border-t border-gray-100">
              <Button variant="outline" className="h-12 px-6 font-semibold">Save & Continue Later</Button>
              <Button className="h-12 px-8 bg-[#7E153A] hover:bg-[#630f2d] text-white font-semibold shadow-md">Save & Proceed to Customize →</Button>
            </div>

          </div>
        </div>

      </div>

      {/* Trust Footer */}
      <div className="mt-8 bg-white border border-gray-100 rounded-xl p-6 flex flex-wrap gap-8 justify-around items-center">
        <div className="flex items-center gap-3">
          <div className="bg-red-50 p-2 rounded-lg text-[#7E153A]"><ShieldCheck size={20} /></div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">100% Secure Payment</h4>
            <p className="text-xs text-gray-500">Your payments are safe with us</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-red-50 p-2 rounded-lg text-[#7E153A]"><Ruler size={20} /></div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Perfect Fit Guarantee</h4>
            <p className="text-xs text-gray-500">Free alterations within 7 days</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-red-50 p-2 rounded-lg text-[#7E153A]"><Scissors size={20} /></div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Premium Quality Stitching</h4>
            <p className="text-xs text-gray-500">Finest craftsmanship</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-red-50 p-2 rounded-lg text-[#7E153A]"><Clock size={20} /></div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">On Time Delivery</h4>
            <p className="text-xs text-gray-500">Delivered to your doorstep</p>
          </div>
        </div>
      </div>
    </div>
  )
}
