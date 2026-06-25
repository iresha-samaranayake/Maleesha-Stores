import React from 'react';
import { Phone, Clock, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Store Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Maleesha Stores</h3>
            <p className="text-sm leading-relaxed mb-4">
              Your friendly neighborhood family-owned grocery store. We are committed to offering the freshest produce, dairy products, and quality staples at affordable prices.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-red-500 fill-current" />
              <span>for our local community</span>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contact & Location</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>No. 001,Church Road,Nagoda,Kandana</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
                <a href="tel:+94112240513" className="hover:text-white transition">
                  +94 11 22 40 513
                </a>
                <a href="tel:+94768419274" className="hover:text-white transition">
                  +94 76 841 9274
                </a>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Opening Hours</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Clock className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-300">Monday - Saturday</p>
                  <p className="text-xs text-slate-500">7:00 AM - 9:00 PM</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-300">Sunday</p>
                  <p className="text-xs text-slate-500">8:00 AM - 1:00 PM</p>
                </div>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Maleesha Stores. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
