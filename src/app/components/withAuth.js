import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { verifyToken } from '../lib/auth';

export function withAuth(WrappedComponent, allowedRoles = []) {
  function WithAuth(props) {
    const router = useRouter();

    useEffect(() => {
      const checkAuth = async () => {
        const token = document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1];
        
        if (!token) {
          router.push('/');
          return;
        }

        try {
          const user = await verifyToken(token);
          
          if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
            router.push('/unauthorized');
          }
        } catch (error) {
          console.error(error);
          router.push('/');
        }
      };

      checkAuth();
    }, [router]);

    return <WrappedComponent {...props} />;
  }

  // Ajout du display name pour le débogage
  WithAuth.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuth;
}