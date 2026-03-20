import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DollarSign, Plus, X, GripVertical, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useConfigStore } from '../../store/configStore';

const allCurrencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
];

interface CurrencyConfigProps {
  defaultCurrency: string;
  enabledCurrencies: string[];
  onDefaultCurrencyChange: (currency: string) => void;
  onEnabledCurrenciesChange: (currencies: string[]) => void;
}

export const CurrencyConfig = ({
  defaultCurrency,
  enabledCurrencies,
  onDefaultCurrencyChange,
  onEnabledCurrenciesChange,
}: CurrencyConfigProps) => {
  const { toast } = useToast();
  const { settingConfiguration, loading, config, loadConfig } = useConfigStore();

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  console.log("selectedCurrency", config);

  // const toggleCurrency = (code: string) => {
  //   if (code === defaultCurrency) {
  //     toast({ title: 'Cannot disable', description: 'Default currency cannot be disabled.', variant: 'destructive' });
  //     return;
  //   }
  //   const updated = enabledCurrencies.includes(code)
  //     ? enabledCurrencies.filter(c => c !== code)
  //     : [...enabledCurrencies, code];
  //   onEnabledCurrenciesChange(updated);
  //   toast({ title: 'Updated', description: `${code} ${enabledCurrencies.includes(code) ? 'disabled' : 'enabled'}.` });
  // };

  const handleDefaultChange = (code: string) => {
    onDefaultCurrencyChange(code);
    // if (!enabledCurrencies.includes(code)) {
    //   onEnabledCurrenciesChange([...enabledCurrencies, code]);
    // }
    settingConfiguration({ currency: code, ignored_domains: [] });
    // toast({ title: 'Default Currency Updated', description: `Default set to ${code}.` });
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <DollarSign className="text-green-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Currency Settings</h2>
            <p className="text-sm text-gray-600">Configure available currencies for deals and opportunities.</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Default Currency</h3>
        <Select value={config.currency || allCurrencies[0].code} onValueChange={handleDefaultChange}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {allCurrencies.map(c => (
              <SelectItem key={c.code} value={c.code}>
                {c.symbol} {c.code} — {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Available Currencies</h3>
        <p className="text-xs text-gray-500 mb-4">Enable the currencies your team can use when creating deals.</p>
        <div className="space-y-2">
          {allCurrencies.map(currency => {
            const enabled = enabledCurrencies.includes(currency.code);
            const isDefault = currency.code === selectedCurrency.currency;
            return (
              <div
                key={currency.code}
                className={`flex items-center justify-between px-4 py-2.5 rounded-lg ${enabled ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg w-8">{currency.symbol}</span>
                  <div>
                    <span className="text-sm font-medium text-gray-900">{currency.code}</span>
                    <span className="text-xs text-gray-500 ml-2">{currency.name}</span>
                  </div>
                  {isDefault && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Default</span>
                  )}
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={() => toggleCurrency(currency.code)}
                  disabled={isDefault}
                />
              </div>
            );
          })}
        </div>
      </div> */}
    </div>
  );
};
