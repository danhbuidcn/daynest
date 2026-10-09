import { Redirect } from 'expo-router';

import { useAuth } from '@/features/auth/AuthProvider';

// "/" → tab Lịch nếu đã đăng nhập, ngược lại → màn Đăng nhập.
export default function Index() {
  const { profile } = useAuth();
  return <Redirect href={profile ? '/calendar' : '/login'} />;
}
