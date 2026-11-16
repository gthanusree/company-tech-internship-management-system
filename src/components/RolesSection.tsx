import React, { useState } from 'react';
import { INTERNSHIP_ROLES } from '../lib/rolesData.ts';
import { ArrowRight, Check, Code, Palette, Megaphone, Briefcase } from 'lucide-react';

interface RolesSectionProps {
  onSelectRole: (roleTitle: string) => void;
}

export const RolesSection: React.FC<RolesSectionProps> = ({ onSelectRole }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Engineering', 'Design', 'Marketing', 'Operations'];

  const filteredRoles = selectedCategory === 'All'
    ? INTERNSHIP_ROLES
    : INTERNSHIP_ROLES.filter((r) => r.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Engineering':
        return <Code className="w-4 h-4 text-[#2F6B60]" />;
      case 'Design':
        return <Palette className="w-4 h-4 text-[#4B524E]" />;
      case 'Marketing':
        return <Megaphone className="w-4 h-4 text-amber-700" />;
      default:
        return <Briefcase className="w-4 h-4 text-emerald-700" />;
    }
  };

  return (
    <section id="roles-section" className="py-16 md:py-20 bg-[#F3F4F1] border-t border-[#E4E6E2] text-[#1C1F1D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#23534A] bg-[#EEF5F2] px-3 py-1 rounded-md border border-[#C8DDD7]">
            Available Opportunities
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#1C1F1D] mt-3 tracking-tight">
            Open Internship Positions
          </h2>
          <p className="text-[#4B524E] text-sm sm:text-base mt-2">
            Explore 12 dynamic internship tracks designed to give you practical, mentorship-backed experience at Company Tech.
          </p>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-[#2F6B60] text-white font-semibold shadow-xs'
                    : 'bg-white text-[#4B524E] hover:bg-[#FAFAF8] hover:text-[#1C1F1D] border border-[#E4E6E2]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRoles.map((role) => (
            <div
              key={role.id}
              className="group bg-white border border-[#E4E6E2] rounded-xl p-5 hover:border-[#2F6B60]/50 hover:shadow-md transition-all flex flex-col justify-between shadow-xs"
            >
              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-md bg-[#F8F9F7] text-[#4B524E] border border-[#E4E6E2]">
                    {getCategoryIcon(role.category)}
                    <span>{role.category}</span>
                  </span>
                  <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md font-medium tabular-nums">
                    {role.openings} Openings
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-bold text-[#1C1F1D] group-hover:text-[#2F6B60] transition-colors">
                  {role.title}
                </h3>
                <p className="text-xs text-[#4B524E] mt-2 leading-relaxed line-clamp-2">
                  {role.description}
                </p>

                {/* Skills */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {role.skills.slice(0, 4).map((skill, index) => (
                    <span
                      key={index}
                      className="text-[11px] bg-[#F8F9F7] text-[#4B524E] px-2 py-0.5 rounded border border-[#E4E6E2]"
                    >
                      {skill}
                    </span>
                  ))}
                  {role.skills.length > 4 && (
                    <span className="text-[10px] text-[#6E7571] self-center">
                      +{role.skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-4 border-t border-[#E4E6E2] flex items-center justify-between">
                <span className="text-xs text-[#6E7571]">1, 2, or 3 Months</span>
                <button
                  onClick={() => onSelectRole(role.title)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F6B60] hover:text-[#24554C] group/btn transition-colors cursor-pointer"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
