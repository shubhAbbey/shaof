'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  AddressDto,
  CreateAddressPayload,
  UpdateAddressPayload,
} from '@ecom/types';
import { useAuth } from './auth-context';

export type AddressDrawerMode = 'list' | 'add' | 'edit';

export interface AddressContextType {
  addresses: AddressDto[];
  selectedAddress: AddressDto | null;
  selectedAddressId: string | null;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  isAddressDrawerOpen: boolean;
  drawerMode: AddressDrawerMode;
  editingAddress: AddressDto | null;
  openAddressDrawer: (mode?: AddressDrawerMode, editAddr?: AddressDto) => void;
  closeAddressDrawer: () => void;
  setDrawerMode: (mode: AddressDrawerMode, editAddr?: AddressDto) => void;
  selectAddress: (address: AddressDto) => Promise<boolean>;
  addAddress: (payload: CreateAddressPayload) => Promise<boolean>;
  editAddress: (id: string, payload: UpdateAddressPayload) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
  refreshAddresses: () => Promise<void>;
  clearError: () => void;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddressDrawerOpen, setIsAddressDrawerOpen] = useState<boolean>(false);
  const [drawerMode, setDrawerModeState] = useState<AddressDrawerMode>('list');
  const [editingAddress, setEditingAddress] = useState<AddressDto | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const refreshAddresses = useCallback(async () => {
    if (!isAuthenticated) {
      setAddresses([]);
      setSelectedAddressId(null);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/account/addresses', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (res.ok) {
        const data = await res.json();
        const loaded: AddressDto[] = Array.isArray(data.addresses) ? data.addresses : [];
        setAddresses(loaded);

        // Derive selected address: preserve current selection if valid, else pick default address or first address
        setSelectedAddressId((prevId) => {
          if (prevId && loaded.some((a) => a.id === prevId)) {
            return prevId;
          }
          const defaultAddr = loaded.find((a) => a.isDefault);
          return defaultAddr?.id || (loaded.length > 0 ? loaded[0].id || null : null);
        });
      } else {
        setAddresses([]);
      }
    } catch (err: any) {
      console.warn('[AddressContext] Failed to load addresses:', err);
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshAddresses();

    const handleAuthChange = () => {
      refreshAddresses();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('ecom:auth_change', handleAuthChange);
      return () => {
        window.removeEventListener('ecom:auth_change', handleAuthChange);
      };
    }
  }, [refreshAddresses]);

  const openAddressDrawer = useCallback(
    (mode: AddressDrawerMode = 'list', editAddr?: AddressDto) => {
      setError(null);
      setDrawerModeState(mode);
      setEditingAddress(editAddr || null);
      setIsAddressDrawerOpen(true);
    },
    []
  );

  const closeAddressDrawer = useCallback(() => {
    setIsAddressDrawerOpen(false);
    setDrawerModeState('list');
    setEditingAddress(null);
    setError(null);
  }, []);

  const setDrawerMode = useCallback(
    (mode: AddressDrawerMode, editAddr?: AddressDto) => {
      setError(null);
      setDrawerModeState(mode);
      setEditingAddress(editAddr || null);
    },
    []
  );

  // Sync selected address to Medusa cart
  const syncAddressToCart = async (addr: AddressDto): Promise<boolean> => {
    try {
      const res = await fetch('/api/cart/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addr),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const selectAddress = useCallback(
    async (address: AddressDto): Promise<boolean> => {
      if (!address || !address.id) return false;
      const prevId = selectedAddressId;
      setSelectedAddressId(address.id);
      setIsMutating(true);
      setError(null);

      try {
        const synced = await syncAddressToCart(address);
        if (!synced) {
          console.warn('[AddressContext] Cart address sync failed; address selected in state.');
        }
        setIsAddressDrawerOpen(false);
        return true;
      } catch (err: any) {
        setSelectedAddressId(prevId);
        setError(err?.message || 'Failed to select delivery address');
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [selectedAddressId]
  );

  const addAddress = useCallback(
    async (payload: CreateAddressPayload): Promise<boolean> => {
      setIsMutating(true);
      setError(null);

      try {
        const res = await fetch('/api/account/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          const errMsg = data.message || data.error || 'Failed to add address';
          setError(errMsg);
          return false;
        }

        const newAddresses: AddressDto[] = Array.isArray(data.addresses)
          ? data.addresses
          : [data.address, ...addresses];
        setAddresses(newAddresses);

        // Auto-select if marked as default or if first address
        if (data.address && (payload.isDefault || newAddresses.length === 1)) {
          setSelectedAddressId(data.address.id || null);
          await syncAddressToCart(data.address);
        }

        setDrawerModeState('list');
        setEditingAddress(null);
        return true;
      } catch (err: any) {
        setError(err?.message || 'Network error while adding address');
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [addresses]
  );

  const editAddress = useCallback(
    async (id: string, payload: UpdateAddressPayload): Promise<boolean> => {
      if (!id) return false;
      setIsMutating(true);
      setError(null);
      const previousAddresses = [...addresses];

      try {
        const res = await fetch(`/api/account/addresses/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          const errMsg = data.message || data.error || 'Failed to update address';
          setError(errMsg);
          return false;
        }

        const updatedList: AddressDto[] = Array.isArray(data.addresses)
          ? data.addresses
          : addresses.map((a) => (a.id === id ? data.address : a));
        setAddresses(updatedList);

        // If edited address is currently selected, sync updated details to cart
        if (selectedAddressId === id && data.address) {
          await syncAddressToCart(data.address);
        } else if (payload.isDefault && data.address) {
          setSelectedAddressId(data.address.id || null);
          await syncAddressToCart(data.address);
        }

        setDrawerModeState('list');
        setEditingAddress(null);
        return true;
      } catch (err: any) {
        setAddresses(previousAddresses);
        setError(err?.message || 'Network error while updating address');
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [addresses, selectedAddressId]
  );

  const deleteAddress = useCallback(
    async (id: string): Promise<boolean> => {
      if (!id) return false;
      setIsMutating(true);
      setError(null);
      const previousAddresses = [...addresses];
      const previousSelectedId = selectedAddressId;

      // Optimistic update
      const filtered = addresses.filter((a) => a.id !== id);
      setAddresses(filtered);

      try {
        const res = await fetch(`/api/account/addresses/${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setAddresses(previousAddresses);
          const errMsg = data.message || data.error || 'Failed to delete address';
          setError(errMsg);
          return false;
        }

        const finalList: AddressDto[] = Array.isArray(data.addresses) ? data.addresses : filtered;
        setAddresses(finalList);

        // If the deleted address was selected, update selection
        if (previousSelectedId === id) {
          const newDefault = finalList.find((a) => a.isDefault) || finalList[0] || null;
          setSelectedAddressId(newDefault?.id || null);
          if (newDefault) {
            await syncAddressToCart(newDefault);
          }
        }

        return true;
      } catch (err: any) {
        setAddresses(previousAddresses);
        setSelectedAddressId(previousSelectedId);
        setError(err?.message || 'Network error while deleting address');
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [addresses, selectedAddressId]
  );

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || null;

  return (
    <AddressContext.Provider
      value={{
        addresses,
        selectedAddress,
        selectedAddressId,
        isLoading,
        isMutating,
        error,
        isAddressDrawerOpen,
        drawerMode,
        editingAddress,
        openAddressDrawer,
        closeAddressDrawer,
        setDrawerMode,
        selectAddress,
        addAddress,
        editAddress,
        deleteAddress,
        refreshAddresses,
        clearError,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = (): AddressContextType => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
};
