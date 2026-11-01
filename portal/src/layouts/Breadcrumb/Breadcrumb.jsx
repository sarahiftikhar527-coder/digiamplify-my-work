import { Link } from 'react-router-dom';

const Breadcrumb = ({ items = [] }) => {
  return (
    <div className="flex items-center gap-2 text-xl">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isOnly = items.length === 1;
        const colorClass = isLast && !isOnly ? 'text-white' : 'text-primary-light';

        return (
          <span key={item.label} className="flex items-center gap-2">
            {item.to && !isLast ? (
              <Link to={item.to} className={colorClass}>
                {item.label}
              </Link>
            ) : (
              <span className={colorClass}>{item.label}</span>
            )}
            {!isLast && <span className="text-white">/</span>}
          </span>
        );
      })}
    </div>
  );
};

export default Breadcrumb;