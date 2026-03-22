import React from "react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white/60">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-gray-600">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="text-ink-900 font-semibold">Food Recommendation System</div>
            <div className="mt-2">Premium, dataset-driven health-tech UI. Built for ingredient-aware decisions.</div>
          </div>
          <div>
            <div className="font-semibold text-ink-900">Useful links</div>
            <div className="mt-2 flex flex-col gap-2">
              <Link className="hover:text-ink-900" to="/">
                Home
              </Link>
              <Link className="hover:text-ink-900" to="/analysis/1">
                Analysis demo
              </Link>
              <Link className="hover:text-ink-900" to="/recommend">
                Food Browser
              </Link>
              <Link className="hover:text-ink-900" to="/community">
                Community
              </Link>
            </div>
          </div>
          <div>
            <div className="font-semibold text-ink-900">Support & Resources</div>
            <div className="mt-2">
              Email: <span className="font-medium">shanmukh.dhanush21@gmail.com</span>
              <br />
              Office: <span className="font-medium">Vel Tech</span>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <a href="https://www.who.int/health-topics/healthy-diet" target="_blank" rel="noopener noreferrer" className="hover:text-ink-900">
                WHO Healthy Diet Guidelines
              </a>
              <a href="https://www.fda.gov/food/food-labeling-nutrition" target="_blank" rel="noopener noreferrer" className="hover:text-ink-900">
                FDA Food Labeling Guide
              </a>
              <a href="https://www.choosemyplate.gov/" target="_blank" rel="noopener noreferrer" className="hover:text-ink-900">
                MyPlate Nutrition Guide
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

