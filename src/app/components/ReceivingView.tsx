import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ClipboardCheck, Plus, Package } from 'lucide-react';
import { BarcodeProductPicker } from './BarcodeProductPicker';
import { mockProducts } from '../data/mockData';

export function ReceivingView() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleConfirmReceipt = () => {
    if (!productId || !quantity) return;
    const product = mockProducts.find(p => p.id === productId);
    alert(`Recebimento confirmado!\nProduto: ${product?.name}\nQuantidade: ${quantity}`);
    setIsDialogOpen(false);
    setProductId('');
    setQuantity('');
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Confirmação de Recebimento</h1>
          <p className="text-gray-600">Baixa de chegada de produtos via código de barras</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="size-4 mr-2" />Confirmar Recebimento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Recebimento de Produtos</DialogTitle>
              <DialogDescription>Escaneie ou digite o código de barras para registrar a chegada</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <BarcodeProductPicker
                value={productId}
                onSelect={setProductId}
                dropdownLabel="Ou selecione um produto"
              />

              <div className="space-y-2">
                <Label>Quantidade Recebida</Label>
                <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" />
              </div>

              <Button onClick={handleConfirmReceipt} className="w-full" disabled={!productId || !quantity}>
                Confirmar Recebimento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="size-5" />Histórico de Recebimentos
          </CardTitle>
          <CardDescription>Produtos recebidos e confirmados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Package className="size-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum recebimento registrado</h3>
            <p className="text-gray-600">Use o leitor de código de barras para confirmar recebimentos</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
