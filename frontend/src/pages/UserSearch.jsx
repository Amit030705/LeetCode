import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import toast from 'react-hot-toast';
import { Search, UserRound, AlertCircle } from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import { ProductShell, GlassCard, EmptyState, SkeletonBlock } from '../components/ProductShell';
import { cx, ui } from '../utils/uiHelpers';

function UserSearch() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!query) {
        setUsers([]);
        return;
      }
      
      setLoading(true);
      try {
        const response = await axiosClient.get(`/users/search?q=${encodeURIComponent(query)}`);
        setUsers(response.data);
      } catch (error) {
        toast.error('Failed to search users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [query]);

  return (
    <ProductShell>
      <main className={cx(ui.layout.page, ui.layout.section)}>
        <div className="mb-6">
          <h1 className={ui.typography.h1}>Search Results</h1>
          <p className={cx(ui.typography.body, 'mt-2')}>
            {query ? `Showing results for "${query}"` : 'Enter a name to search for users.'}
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <SkeletonBlock key={i} className="h-24" />
            ))}
          </div>
        ) : users.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {users.map(user => (
              <NavLink 
                key={user._id} 
                to={`/user/${user._id}`}
                className="group block"
              >
                <GlassCard className="flex items-center gap-4 p-4 transition-all hover:border-blue-500/30 hover:bg-slate-900/80">
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.firstName} 
                      className="h-14 w-14 rounded-full object-cover ring-2 ring-slate-800 transition group-hover:ring-blue-500/30"
                    />
                  ) : (
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-blue-500/10 text-xl font-bold text-blue-400 ring-2 ring-slate-800 transition group-hover:ring-blue-500/30">
                      {(user.firstName || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                      {user.solvedCount} problems solved
                    </p>
                  </div>
                </GlassCard>
              </NavLink>
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={query ? AlertCircle : Search} 
            title={query ? "No users found" : "Search for users"} 
            description={query ? `We couldn't find any users matching "${query}".` : "Use the search bar above to find other coders."} 
          />
        )}
      </main>
    </ProductShell>
  );
}

export default UserSearch;
