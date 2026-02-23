import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Package, Plus, Barcode, Search, Filter, Camera } from 'lucide-react';
import { mockProducts } from '../data/mockData';
import { BarcodeScanner } from './BarcodeScanner';
import type { Product } from '../types';

export function CatalogView() {
  const [products, setProducts] = useState(mockProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    description: '',
    category: 'alimento' as 'alimento' | 'medicamento' | 'enxoval' | 'outro',
    unit: '',
    requiresBarcode: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProduct) {
      setProducts(products.map(p =>
        p.id === editingProduct.id
          ? { ...p, ...formData }
          : p
      ));
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        ...formData,
        createdAt: new Date(),
      };
      setProducts([...products, newProduct]);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      barcode: product.barcode,
      name: product.name,
      description: product.description,
      category: product.category,
      unit: product.unit,
      requiresBarcode: product.requiresBarcode,
    });
    setIsDialogOpen(true);
  };

  const handleScanSuccess = (decodedText: string) => {
    setFormData({ ...formData, barcode: decodedText });
    setIsScannerOpen(false);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      barcode: '',
      name: '',
      description: '',
      category: 'alimento',
      unit: '',
      requiresBarcode: true,
    });
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      alimento: 'bg-green-100 text-green-700',
      medicamento: 'bg-red-100 text-red-700',
      enxoval: 'bg-blue-100 text-blue-700',
      outro: 'bg-gray-100 text-gray-700',
    };
    return colors[category as keyof typeof colors] || colors.outro;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Catálogo Global de Produtos</h1>
          <p className="text-gray-600">Gestão centralizada de itens alimentícios, medicamentos e enxoval</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Atualize as informações do produto' : 'Cadastre um novo item no catálogo'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="barcode">Código de Barras</Label>
                  <div className="flex gap-2">
                    <Input
                      id="barcode"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      placeholder="7891234567890"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsScannerOpen(true)}
                      title="Escanear Código"
                      className="shrink-0"
                    >
                      <Camera className="size-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alimento">Alimento</SelectItem>
                      <SelectItem value="medicamento">Medicamento</SelectItem>
                      <SelectItem value="enxoval">Enxoval</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome do Produto</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Arroz Branco 5kg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição detalhada do produto"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unidade de Medida</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="Ex: kg, unidade, caixa, litro"
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </Button>
                <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>
                  Cancelar
                </Button>
              </div>
            </form>

            {isScannerOpen && (
              <BarcodeScanner
                onScanSuccess={handleScanSuccess}
                onClose={() => setIsScannerOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por nome, código de barras ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <Filter className="size-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Categorias</SelectItem>
            <SelectItem value="alimento">Alimentos</SelectItem>
            <SelectItem value="medicamento">Medicamentos</SelectItem>
            <SelectItem value="enxoval">Enxoval</SelectItem>
            <SelectItem value="outro">Outros</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription className="mt-1">{product.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className={getCategoryColor(product.category)}>
                    {product.category}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Unidade: <span className="font-medium">{product.unit}</span>
                  </span>
                </div>

                {product.barcode ? (
                  <div className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                    <Barcode className="size-4 text-gray-600" />
                    <span className="font-mono">{product.barcode}</span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 bg-yellow-50 p-2 rounded">
                    Sem código de barras (registro manual)
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Cadastrado em: {new Date(product.createdAt).toLocaleDateString('pt-BR')}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleEdit(product)}
                >
                  <Package className="size-4 mr-2" />
                  Editar Produto
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="size-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterCategory !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece cadastrando o primeiro produto do catálogo'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
