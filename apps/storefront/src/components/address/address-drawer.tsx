'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  ArrowLeft,
  Check,
  Edit2,
  Trash2,
  AlertCircle,
  Home,
  Briefcase,
  Building2,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { Drawer } from '../ui/drawer';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { useAddress } from '../../context/address-context';
import type { AddressDto, AddressType } from '@ecom/types';
import { cn } from '../../lib/utils';

const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export const AddressDrawer: React.FC = () => {
  const {
    addresses,
    selectedAddressId,
    isLoading,
    isMutating,
    error,
    isAddressDrawerOpen,
    drawerMode,
    editingAddress,
    closeAddressDrawer,
    setDrawerMode,
    selectAddress,
    addAddress,
    editAddress,
    deleteAddress,
    clearError,
  } = useAddress();

  // Form local state
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('');
  const [addressType, setAddressType] = useState<AddressType>('home');
  const [isDefault, setIsDefault] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sync form state when switching modes or editing an address
  useEffect(() => {
    if (drawerMode === 'edit' && editingAddress) {
      setFullName(editingAddress.fullName || '');
      setMobile(editingAddress.mobile ? editingAddress.mobile.replace(/^\+91/, '') : '');
      setAddressLine1(editingAddress.addressLine1 || '');
      setAddressLine2(editingAddress.addressLine2 || '');
      setLandmark(editingAddress.landmark || '');
      setCity(editingAddress.city || '');
      setState(editingAddress.state || 'Karnataka');
      setPincode(editingAddress.pincode || '');
      setAddressType(editingAddress.addressType || 'home');
      setIsDefault(Boolean(editingAddress.isDefault));
    } else if (drawerMode === 'add') {
      setFullName('');
      setMobile('');
      setAddressLine1('');
      setAddressLine2('');
      setLandmark('');
      setCity('');
      setState('Karnataka');
      setPincode('');
      setAddressType('home');
      setIsDefault(addresses.length === 0);
    }
    setFormErrors({});
  }, [drawerMode, editingAddress, addresses.length]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }

    const cleanMobile = mobile.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length !== 10) {
      errors.mobile = 'Enter a valid 10-digit mobile number';
    }

    if (!addressLine1.trim() || addressLine1.trim().length < 3) {
      errors.addressLine1 = 'Address line 1 must be at least 3 characters';
    }

    if (!city.trim()) {
      errors.city = 'City is required';
    }

    if (!state.trim()) {
      errors.state = 'State is required';
    }

    const cleanPincode = pincode.replace(/\D/g, '');
    if (!cleanPincode || cleanPincode.length !== 6) {
      errors.pincode = 'Enter a valid 6-digit PIN code';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isMutating) return;

    console.log("fullName: " + fullName + ", mobile: " + mobile + ", addressLine1: " + addressLine1 + ", addressLine2: " + addressLine2 + ", landmark: " + landmark + ", city: " + city + ", state: " + state + ", pincode: " + pincode + ", addressType: " + addressType + ", isDefault: " + isDefault);

    const payload = {
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim() || undefined,
      landmark: landmark.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      countryCode: 'in',
      addressType,
      isDefault,
    };

    console.log("payload: ", payload)

    if (drawerMode === 'edit' && editingAddress?.id) {
      await editAddress(editingAddress.id, payload);
    } else {
      await addAddress(payload);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id?: string) => {
    e.stopPropagation();
    if (!id || isMutating) return;
    setDeletingId(id);
    try {
      await deleteAddress(id);
    } finally {
      setDeletingId(null);
    }
  };

  const getAddressTypeIcon = (type: AddressType) => {
    switch (type) {
      case 'office':
        return <Briefcase className="h-3.5 w-3.5" />;
      case 'other':
        return <Building2 className="h-3.5 w-3.5" />;
      case 'home':
      default:
        return <Home className="h-3.5 w-3.5" />;
    }
  };

  // Header Title and back navigation
  const renderHeader = () => {
    if (drawerMode === 'add') {
      return (
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-testid="address-drawer-back-btn"
            onClick={() => setDrawerMode('list')}
            aria-label="Back to addresses list"
            className="p-1 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 id="drawer-title" className="text-base sm:text-lg font-bold text-gray-900">
              Add New Address
            </h2>
            <p className="text-[11px] text-gray-500">Provide accurate details for express delivery</p>
          </div>
        </div>
      );
    }

    if (drawerMode === 'edit') {
      return (
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-testid="address-drawer-back-btn"
            onClick={() => setDrawerMode('list')}
            aria-label="Back to addresses list"
            className="p-1 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 id="drawer-title" className="text-base sm:text-lg font-bold text-gray-900">
              Edit Address
            </h2>
            <p className="text-[11px] text-gray-500">Update your saved delivery address</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between w-full pr-6">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-brand-600 shrink-0" />
          <h2 id="drawer-title" className="text-base sm:text-lg font-bold text-gray-900">
            Delivery Addresses {addresses.length > 0 && <span className="text-sm font-normal text-gray-500">({addresses.length})</span>}
          </h2>
        </div>
        <button
          type="button"
          data-testid="address-drawer-add-btn"
          onClick={() => setDrawerMode('add')}
          className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-brand-50 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add New</span>
        </button>
      </div>
    );
  };

  return (
    <Drawer
      isOpen={isAddressDrawerOpen}
      onClose={closeAddressDrawer}
      position="right"
      size="md"
      showCloseButton
      title={renderHeader()}
    >
      <div className="space-y-4">
        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-800 text-xs border border-red-100">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span className="flex-1 font-medium">{error}</span>
            <button type="button" onClick={clearError} className="font-bold text-red-700 hover:underline">
              &times;
            </button>
          </div>
        )}

        {/* 1. Loading State */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            <p className="text-xs text-gray-400 font-medium">Loading saved addresses...</p>
          </div>
        ) : drawerMode === 'list' ? (
          /* 2. Address List Mode */
          addresses.length === 0 ? (
            /* Empty State */
            <div data-testid="address-empty-state" className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                <MapPin className="h-10 w-10 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900">No Saved Addresses Found</h3>
                <p className="text-xs text-gray-500 max-w-xs">
                  Add a delivery address to ensure seamless delivery of your orders.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                data-testid="empty-add-address-btn"
                onClick={() => setDrawerMode('add')}
                leftIcon={<Plus className="h-4 w-4" />}
                className="mt-2 font-bold"
              >
                Add New Address
              </Button>
            </div>
          ) : (
            /* Active Address List */
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500">Select an address to deliver to:</p>
              <div className="space-y-3">
                {addresses.map((address) => {
                  const isSelected = selectedAddressId === address.id;
                  const isBeingDeleted = deletingId === address.id;

                  return (
                    <div
                      key={address.id || Math.random().toString()}
                      data-testid={`address-card-${address.id}`}
                      onClick={() => selectAddress(address)}
                      className={cn(
                        'relative p-4 rounded-2xl border transition-all cursor-pointer text-left',
                        isSelected
                          ? 'border-brand-600 bg-brand-50/20 ring-1 ring-brand-600 shadow-xs'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-2xs'
                      )}
                    >
                      {/* Top Badges & Selection Indicator */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'h-5 w-5 rounded-full flex items-center justify-center border transition-colors',
                              isSelected
                                ? 'bg-brand-600 border-brand-600 text-white'
                                : 'border-gray-300 bg-white'
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </span>
                          <span className="text-sm font-bold text-gray-900">{address.fullName}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="secondary"
                            size="sm"
                            className="capitalize flex items-center gap-1 text-[10px] font-bold text-gray-700 bg-gray-100"
                          >
                            {getAddressTypeIcon(address.addressType)}
                            {address.addressType}
                          </Badge>
                          {address.isDefault && (
                            <Badge
                              variant="success"
                              size="sm"
                              className="text-[10px] font-bold"
                            >
                              Default
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Address Lines */}
                      <div className="text-xs text-gray-600 space-y-0.5 pl-7">
                        <p className="font-medium text-gray-800">{address.addressLine1}</p>
                        {address.addressLine2 && <p>{address.addressLine2}</p>}
                        {address.landmark && (
                          <p className="text-[11px] text-gray-500 italic">Landmark: {address.landmark}</p>
                        )}
                        <p className="font-semibold text-gray-900">
                          {address.city}, {address.state} — {address.pincode}
                        </p>
                        <p className="text-gray-500 font-medium pt-1">Mobile: {address.mobile}</p>
                      </div>

                      {/* Card Action Controls */}
                      <div className="flex items-center justify-end gap-2 mt-3 pt-2.5 border-t border-gray-100 pl-7">
                        <button
                          type="button"
                          data-testid={`address-edit-btn-${address.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDrawerMode('edit', address);
                          }}
                          disabled={isMutating}
                          className="text-xs font-semibold text-gray-600 hover:text-brand-600 flex items-center gap-1 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          data-testid={`address-delete-btn-${address.id}`}
                          onClick={(e) => handleDelete(e, address.id)}
                          disabled={isMutating || isBeingDeleted}
                          className="text-xs font-semibold text-gray-400 hover:text-red-600 flex items-center gap-1 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          {isBeingDeleted ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Add CTA */}
              <Button
                variant="outline"
                size="md"
                onClick={() => setDrawerMode('add')}
                leftIcon={<Plus className="h-4 w-4" />}
                className="w-full mt-4 font-bold border-dashed border-gray-300 hover:border-brand-500 hover:text-brand-600"
              >
                + Add Another Address
              </Button>
            </div>
          )
        ) : (
          /* 3. Add / Edit Address Form Mode */
          <form onSubmit={handleFormSubmit} data-testid="address-form" className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="address-fullname" className="block text-xs font-bold text-gray-900 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="address-fullname"
                data-testid="input-fullname"
                type="text"
                placeholder="e.g. Priya Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={formErrors.fullName}
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label htmlFor="address-mobile" className="block text-xs font-bold text-gray-900 mb-1">
                Mobile Number (10 digits) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                  +91
                </span>
                <Input
                  id="address-mobile"
                  data-testid="input-mobile"
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  className="pl-11"
                  error={formErrors.mobile}
                />
              </div>
            </div>

            {/* Address Line 1 */}
            <div>
              <label htmlFor="address-line1" className="block text-xs font-bold text-gray-900 mb-1">
                Address Line 1 (Flat, House no., Building, Street) <span className="text-red-500">*</span>
              </label>
              <Input
                id="address-line1"
                data-testid="input-addressline1"
                type="text"
                placeholder="e.g. Flat 402, Green Valley Apartments"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                error={formErrors.addressLine1}
              />
            </div>

            {/* Address Line 2 */}
            <div>
              <label htmlFor="address-line2" className="block text-xs font-bold text-gray-900 mb-1">
                Address Line 2 (Area, Colony, Sector) <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <Input
                id="address-line2"
                data-testid="input-addressline2"
                type="text"
                placeholder="e.g. Koramangala 4th Block"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
              />
            </div>

            {/* Landmark */}
            <div>
              <label htmlFor="address-landmark" className="block text-xs font-bold text-gray-900 mb-1">
                Landmark <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <Input
                id="address-landmark"
                data-testid="input-landmark"
                type="text"
                placeholder="e.g. Near Sony Signal / Opposite Central Mall"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
              />
            </div>

            {/* City & PIN Code */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="address-city" className="block text-xs font-bold text-gray-900 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <Input
                  id="address-city"
                  data-testid="input-city"
                  type="text"
                  placeholder="e.g. Bengaluru"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  error={formErrors.city}
                />
              </div>

              <div>
                <label htmlFor="address-pincode" className="block text-xs font-bold text-gray-900 mb-1">
                  PIN Code <span className="text-red-500">*</span>
                </label>
                <Input
                  id="address-pincode"
                  data-testid="input-pincode"
                  type="text"
                  maxLength={6}
                  placeholder="560034"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  error={formErrors.pincode}
                />
              </div>
            </div>

            {/* State Dropdown */}
            <div>
              <label htmlFor="address-state" className="block text-xs font-bold text-gray-900 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <select
                id="address-state"
                data-testid="select-state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              {formErrors.state && <p className="text-xs text-red-500 mt-1">{formErrors.state}</p>}
            </div>

            {/* Address Type Selector */}
            <div>
              <span className="block text-xs font-bold text-gray-900 mb-1.5">Address Type</span>
              <div className="grid grid-cols-3 gap-2">
                {(['home', 'office', 'other'] as AddressType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    data-testid={`address-type-${type}`}
                    onClick={() => setAddressType(type)}
                    className={cn(
                      'py-2 px-3 rounded-xl border text-xs font-bold capitalize flex items-center justify-center gap-1.5 transition-all',
                      addressType === type
                        ? 'border-brand-600 bg-brand-50 text-brand-700 ring-1 ring-brand-600'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    )}
                  >
                    {getAddressTypeIcon(type)}
                    <span>{type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Default Address Checkbox */}
            <div className="pt-2">
              <Checkbox
                id="address-is-default"
                data-testid="checkbox-is-default"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                label="Set as default delivery address"
              />
            </div>

            {/* Form Submit & Cancel Actions */}
            <div className="flex items-center gap-3 pt-3">
              <Button
                variant="outline"
                size="md"
                type="button"
                onClick={() => setDrawerMode('list')}
                disabled={isMutating}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                data-testid="address-submit-btn"
                disabled={isMutating}
                className="flex-1 font-bold shadow-xs"
              >
                {isMutating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    <span>Saving...</span>
                  </>
                ) : drawerMode === 'edit' ? (
                  'Update Address'
                ) : (
                  'Save Address'
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Security / Quality Footer */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 pt-4 border-t border-gray-100">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
          <span>Encrypted and securely stored with Medusa Commerce</span>
        </div>
      </div>
    </Drawer>
  );
};
