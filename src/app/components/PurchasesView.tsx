import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ShoppingCart, Plus, DollarSign } from 'lucide-react';
import { mockPurchases, mockProducts } from '../data/mockData';
import { BarcodeProductPicker } from './BarcodeProductPicker';
import type { Purchase } from '../types';

export function PurchasesView() {
  const [purchases, setPurchases] = useState(mockPurchases);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ productId: '', quantity: '', unitPrice: '', supplierId: 'supplier-1' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = parseFloat(formData.quantity);
    const unitPrice = parseFloat(formData.unitPrice);
    const newPurchase: Purchase = {
      id: `purchase-${Date.now()}`, productId: formData.productId, quantity, unitPrice,
      totalPrice: quantity * unitPrice, supplierId: formData.supplierId,
      purchaseDate: new Date(), receivedBy: 'user-2', createdAt: new Date(),
    };
    setPurchases([newPurchase, ...purchases]);
    setIsDialogOpen(false);
    setFormData({ productId: '', quantity: '', unitPrice: '', supplierId: 'supplier-1' });
  };

  const totalValue = purchases.reduce((sum, p) => sum + p.totalPrice, 0);
  const totalItems = purchases.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Compras</h1>
          <p className="text-gray-600">Registro de aquisições com rastreamento de custos</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="size-4 mr-2" />Registrar Compra</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nova Compra</DialogTitle>
              <DialogDescription>Registre a entrada de produtos via nota fiscal (bib)</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <BarcodeProductPicker
                value={formData.productId}
                onSelect={productId => setFormData({ ...formData, productId })}
                dropdownLabel="Ou selecione do catálogo"
                dropdownProducts={mockProducts.map(p => ({
                  product: p,
                  subtitle: p.barcode || 'Sem código',
                }))}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input type="number" step="0.01" value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })} placeholder="0" required />
                </div>
                <div className="space-y-2">
                  <Label>Preço Unitário (R$)</Label>
                  <Input type="number" step="0.01" value={formData.unitPrice}
                    onChange={e => setFormData({ ...formData, unitPrice: e.target.value })} placeholder="0.00" required />
                </div>
              </div>

              {formData.quantity && formData.unitPrice && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Valor Total da Compra:</p>
                  <p className="text-2xl font-bold text-blue-600">
                    R$ {(parseFloat(formData.quantity) * parseFloat(formData.unitPrice)).toFixed(2)}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">Registrar Compra</Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Compras</CardTitle>
            <ShoppingCart className="size-4 text-gray-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{purchases.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens Adquiridos</CardTitle>
            <ShoppingCart className="size-4 text-gray-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalItems}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Investido</CardTitle>
            <DollarSign className="size-4 text-green-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">R$ {totalValue.toFixed(2)}</div></CardContent>
        </Card>
      </div>

      {/* Purchases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Compras</CardTitle>
          <CardDescription>Registro completo de aquisições com rastreamento de custos</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Preço Unit.</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead>Recebido Por</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map(purchase => {
                const product = mockProducts.find(p => p.id === purchase.productId);
                return (
                  <TableRow key={purchase.id}>
                    <TableCell>{new Date(purchase.purchaseDate).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <p className="font-medium">{product?.name}</p>
                      <p className="text-xs text-gray-600">{product?.barcode || 'Sem código'}</p>
                    </TableCell>
                    <TableCell className="text-right">{purchase.quantity} {product?.unit}</TableCell>
                    <TableCell className="text-right">R$ {purchase.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium text-green-600">R$ {purchase.totalPrice.toFixed(2)}</span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{purchase.receivedBy}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
