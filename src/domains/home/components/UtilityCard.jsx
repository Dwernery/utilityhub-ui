import { Link } from "react-router-dom";

export function UtilityCard({icon: Icon, title, to, children}) {
  return (
    <Link
      to={to}
      className={`group bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col flex-1 h-full lg:self-start hover:border-blue-300 hover:shadow-md transition-all`}
    >
      <div className="flex items-center mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50`}>
          <Icon className={`w-[18px] h-[18px] text-blue-600`}/>
        </div>

        <h3 className={`ml-3 text-base font-bold text-slate-800`}>
          {title}
        </h3>

        <span className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full ml-auto text-green-600 bg-green-50`}>
          Live
        </span>
      </div>
      
      {children}
    </Link>
  );
}
