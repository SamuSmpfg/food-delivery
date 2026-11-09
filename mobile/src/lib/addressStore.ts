import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export type AddressLabel = 'Home' | 'Work' | 'Other';

export type Address = {
  id: string;
  label: AddressLabel;
  address: string;
  street: string;
  postCode: string;
  apartment: string;
  latitude: number;
  longitude: number;
};

export type AddressInput = Omit<Address, 'id'> & { id?: string };

const STORAGE_KEY = 'dfood:addresses';

let cache: Address[] = [];
let loaded = false;
const listeners = new Set<(items: Address[]) => void>();

const emit = () => {
  listeners.forEach((listener) => listener(cache));
};

const persist = async () => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
};

export const loadAddresses = async () => {
  if (loaded) return cache;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as Address[]) : [];
  } catch {
    cache = [];
  }
  loaded = true;
  emit();
  return cache;
};

export const getAddressById = async (id: string) => {
  const items = await loadAddresses();
  return items.find((item) => item.id === id) ?? null;
};

export const saveAddress = async (data: AddressInput) => {
  await loadAddresses();
  if (data.id) {
    cache = cache.map((item) =>
      item.id === data.id ? ({ ...item, ...data } as Address) : item
    );
  } else {
    cache = [...cache, { ...data, id: Date.now().toString() }];
  }
  emit();
  await persist();
};

export const removeAddress = async (id: string) => {
  await loadAddresses();
  cache = cache.filter((item) => item.id !== id);
  emit();
  await persist();
};

export const useAddresses = () => {
  const [items, setItems] = useState<Address[]>(cache);

  useEffect(() => {
    listeners.add(setItems);
    loadAddresses().then(setItems);
    return () => {
      listeners.delete(setItems);
    };
  }, []);

  return items;
};