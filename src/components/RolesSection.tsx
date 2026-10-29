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
        return <Code className="w-4 h-4 text-blue-400" />;
      case 'Design':
        return <Palette className="w-4 h-4 text-purple-400" />;
      case 'Marketing':
        return <Megaphone className="w-4 h-4 text-amber-400" />;
      default:
        return <Briefcase className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <section id="roles-section" className="py-16 md:py-20 bg-slate-900 border-t border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Available Opportunities
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-3">
            Open Internship Positions
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2">
            Explore 12 dynamic internship tracks designed to give you practical, mentorship-backed experience at Company Tech.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
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
              className="group bg-slate-950/70 border border-slate-800 rounded-xl p-5 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700">
                    {getCategoryIcon(role.category)}
                    <span>{role.category}</span>
                  </span>
                  <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                    {role.openings} Openings
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                  {role.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">
                  {role.description}
                </p>

                {/* Skills */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {role.skills.slice(0, 4).map((skill, index) => (
                    <span
                      key={index}
                      className="text-[11px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800"
                    >
                      {skill}
                    </span>
                  ))}
                  {role.skills.length > 4 && (
                    <span className="text-[10px] text-slate-500 self-center">
                      +{role.skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-500">1, 2, or 3 Months</span>
                <button
                  onClick={() => onSelectRole(role.title)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 group/btn transition-colors"
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
