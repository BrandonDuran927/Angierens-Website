import { Link } from '@tanstack/react-router'
import { useRouterState } from '@tanstack/react-router';

export default function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isOnSignup = pathname === '/signup';

  // Hide header on customer interface pages
  const isCustomerInterface = pathname.startsWith('/customer-interface');
  const isAdminInterface = pathname.startsWith('/admin-interface');

  if (isCustomerInterface || isAdminInterface) {
    return null;
  }

  return (
    <nav className="w-full flex justify-end gap-4 p-6 pr-12">
      <ul className="flex gap-20 bg-[#964B00] text-yellow-400 mr-10 py-2 px-10 rounded-xl shadow-md text-lg font-semibold">
        <li><Link to="/">HOME</Link></li>
        <li><a href="#about">ABOUT US</a></li>
        <li><a href="#contact">CONTACT</a></li>
      </ul>

      <Link to={isOnSignup ? '/login' : '/signup'}>
        <button className="bg-[#964B00] text-yellow-400 font-semibold py-2 px-6 text-lg rounded-full shadow-md cursor-pointer">
          {isOnSignup ? 'LOGIN' : 'SIGN UP'}
        </button>
      </Link>
    </nav>
  );
}