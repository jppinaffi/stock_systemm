import { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import { mockProducts } from '../data/mockData';
import type { Product } from '../types';

interface BarcodeProductPickerProps {
    /** Currently selected product ID */
    value: string;
    /** Callback when a product is selected (via barcode or dropdown) */
    onSelect: (productId: string) => void;
    /** Optional list of products to show in dropdown. Defaults to all mockProducts */
    dropdownProducts?: { product: Product; subtitle?: string }[];
    /** Label for the dropdown section */
    dropdownLabel?: string;
    /** Placeholder for dropdown */
    dropdownPlaceholder?: string;
}

/**
 * Reusable component that lets the user identify a product via:
 * 1. Typing/scanning a barcode
 * 2. Selecting from a dropdown
 *
 * Used in: PurchasesView, ReceivingView, ConsumptionView, OrdersView
 */
export function BarcodeProductPicker({
    value,
    onSelect,
    dropdownProducts,
    dropdownLabel = 'Ou selecione um produto',
    dropdownPlaceholder = 'Selecione um produto',
}: BarcodeProductPickerProps) {
    const [barcodeInput, setBarcodeInput] = useState('');
    const [lookupResult, setLookupResult] = useState<{ found: boolean; name: string } | null>(null);

    const handleLookup = () => {
        if (!barcodeInput.trim()) return;
        const product = mockProducts.find(p => p.barcode === barcodeInput.trim());
        if (product) {
            setLookupResult({ found: true, name: product.name });
            onSelect(product.id);
        } else {
            setLookupResult({ found: false, name: '' });
        }
    };

    const handleDropdownSelect = (productId: string) => {
        onSelect(productId);
        const product = mockProducts.find(p => p.id === productId);
        if (product?.barcode) {
            setBarcodeInput(product.barcode);
            setLookupResult({ found: true, name: product.name });
        } else {
            setBarcodeInput('');
            setLookupResult(null);
        }
    };

    // Default dropdown items: all products
    const items = dropdownProducts ?? mockProducts.map(p => ({
        product: p,
        subtitle: p.barcode || 'Sem código',
    }));

    return (
        <div className="space-y-4">
            {/* Barcode input */}
            <div className="space-y-2">
                <Label>Código de Barras</Label>
                <div className="flex gap-2">
                    <Input
                        placeholder="Digite ou escaneie o código de barras"
                        value={barcodeInput}
                        onChange={e => { setBarcodeInput(e.target.value); setLookupResult(null); }}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleLookup(); } }}
                    />
                    <Button type="button" variant="outline" onClick={handleLookup}>
                        <Search className="size-4" />
                    </Button>
                </div>
                {lookupResult && (
                    <div className={`text-xs p-2 rounded flex items-center gap-2 ${lookupResult.found
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {lookupResult.found
                            ? <><CheckCircle className="size-3" /> Produto encontrado: <strong>{lookupResult.name}</strong></>
                            : <><XCircle className="size-3" /> Nenhum produto encontrado para este código</>
                        }
                    </div>
                )}
            </div>

            {/* Dropdown */}
            <div className="space-y-2">
                <Label>{dropdownLabel}</Label>
                <Select value={value} onValueChange={handleDropdownSelect}>
                    <SelectTrigger>
                        <SelectValue placeholder={dropdownPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {items.map(({ product, subtitle }) => (
                            <SelectItem key={product.id} value={product.id}>
                                {product.name}{subtitle ? ` — ${subtitle}` : ''}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
