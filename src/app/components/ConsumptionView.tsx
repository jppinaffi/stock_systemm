import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { FileText, Plus, User, Calendar } from 'lucide-react';
import { mockConsumptions, mockProducts, mockInventory } from '../data/mockData';
import { BarcodeProductPicker } from './BarcodeProductPicker';
import type { User as UserType, Consumption } from '../types';

interface ConsumptionViewProps { currentUser: UserType }

export function ConsumptionView({ currentUser }: ConsumptionViewProps) {
  const branchId = currentUser.branchId!;
  const [consumptions, setConsumptions] = useState(mockConsumptions.filter(c => c.branchId === branchId));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ productId: '', quantity: '', consumedBy: '', consumedByCPF: '' });

  const availableInventory = mockInventory.filter(inv => inv.branchId === branchId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = parseFloat(formData.quantity);
    const inventory = availableInventory.find(inv => inv.productId === formData.productId);
    if (!inventory || inventory.quantity < quantity) { alert('Estoque insuficiente!'); return; }

    const newConsumption: Consumption = {
      id: `cons-${Date.now()}`, productId: formData.productId, branchId, quantity,
      consumedBy: formData.consumedBy, consumedByCPF: formData.consumedByCPF,
      consumedAt: new Date(), unitPrice: inventory.unitPrice, totalPrice: quantity * inventory.unitPrice,
    };
    setConsumptions([newConsumption, ...consumptions]);
    setIsDialogOpen(false);
    setFormData({ productId: '', quantity: '', consumedBy: '', consumedByCPF: '' });
  };

  const todayCount = consumptions.filter(c => new Date(c.consumedAt).toDateString() === new Date().toDateString()).length;
  const totalValue = consumptions.reduce((sum, c) => sum + c.totalPrice, 0);

  // Dropdown items: only products actually in stock at this branch
  const dropdownItems = availableInventory.map(inv => {
    const product = mockProducts.find(p => p.id === inv.productId);
    return { product: product!, subtitle: `Disp.: ${inv.quantity} ${product?.unit}` };
  }).filter(item => item.product);

  const selectedStock = availableInventory.find(inv => inv.productId === formData.productId)?.quantity;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Registro de Consumo</h1>
          <p className="text-gray-600">Check-out de itens com rastreamento por colaborador</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="size-4 mr-2" />Registrar Consumo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Novo Consumo</DialogTitle>
              <DialogDescription>Registre a saída de itens com identificação do colaborador</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <BarcodeProductPicker
                value={formData.productId}
                onSelect={pid => setFormData({ ...formData, productId: pid })}
                dropdownProducts={dropdownItems}
                dropdownLabel="Ou selecione do estoque disponível"
              />

              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input type="number" step="0.01" value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: e.target.value })} placeholder="0" required />
                {formData.productId && selectedStock !== undefined && (
                  <p className="text-xs text-gray-600">Estoque disponível: {selectedStock}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Nome do Colaborador</Label>
                <Input value={formData.consumedBy}
                  onChange={e => setFormData({ ...formData, consumedBy: e.target.value })} placeholder="Nome completo" required />
              </div>
              <div className="space-y-2">
                <Label>CPF do Colaborador</Label>
                <Input value={formData.consumedByCPF}
                  onChange={e => setFormData({ ...formData, consumedByCPF: e.target.value })} placeholder="000.000.000-00" required />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">Registrar Consumo</Button>
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
            <CardTitle className="text-sm font-medium">Consumos Hoje</CardTitle>
            <Calendar className="size-4 text-gray-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{todayCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Consumos</CardTitle>
            <FileText className="size-4 text-gray-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{consumptions.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Consumido</CardTitle>
            <FileText className="size-4 text-gray-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">R$ {totalValue.toFixed(2)}</div></CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Consumo</CardTitle>
          <CardDescription>Rastreamento completo de saídas por colaborador</CardDescription>
        </CardHeader>
        <CardContent>
          {consumptions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="size-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum consumo registrado</h3>
              <p className="text-gray-600">Comece registrando a primeira saída de produtos</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Consumido Por</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead className="text-right">Qtde</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consumptions.map(c => {
                  const product = mockProducts.find(p => p.id === c.productId);
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <p className="font-medium">{new Date(c.consumedAt).toLocaleDateString('pt-BR')}</p>
                        <p className="text-xs text-gray-600">{new Date(c.consumedAt).toLocaleTimeString('pt-BR')}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{product?.name}</p>
                        <p className="text-xs text-gray-600">{product?.category}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2"><User className="size-4 text-gray-400" />{c.consumedBy}</div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{c.consumedByCPF}</TableCell>
                      <TableCell className="text-right">{c.quantity} {product?.unit}</TableCell>
                      <TableCell className="text-right font-medium text-blue-600">R$ {c.totalPrice.toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
