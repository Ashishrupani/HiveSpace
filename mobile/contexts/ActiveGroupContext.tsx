import React, { createContext, useContext } from 'react';
 
const ActiveGroupContext = createContext<string>('');
 
export function ActiveGroupProvider({
  groupId,
  children,
}: {
  groupId: string;
  children: React.ReactNode;
}) {
  return (
    <ActiveGroupContext.Provider value={groupId}>
      {children}
    </ActiveGroupContext.Provider>
  );
}
 
/** Use this instead of useLocalSearchParams() to get the current group id */
export function useActiveGroupId(): string {
  return useContext(ActiveGroupContext);
}