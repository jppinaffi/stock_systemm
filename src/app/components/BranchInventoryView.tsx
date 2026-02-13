import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import {
    Archive,
    Package,
    AlertCircle,
    Search,
    Filter,
    Building2,
    TrendingDown,
    BarChart3,
    Landmark,
} from 'lucide-react';
import { mockInventory, mockCentralInventory, mockProducts, mockBranches } from '../data/mockData';

export function BranchInventoryView() {
    const [activeTab, setActiveTab] = useState('central');
    const [selectedBranch, setSelectedBranch] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');

    const activeBranches = mockBranches.filter(b => b.active);

    const filteredCentralInventory = mockCentralInventory.filter(inv => {
        const product = mockProducts.find(p => p.id === inv.productId);
        if (!product) return false;
        const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
        const matchesSearch =
            searchTerm === '' ||
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.barcode.includes(searchTerm);
        return matchesCategory && matchesSearch;
    });

    const centralTotalItems = filteredCentralInventory.reduce((sum, inv) => sum + inv.quantity, 0);
    const centralTotalValue = filteredCentralInventory.reduce((sum, inv) => sum + inv.quantity * inv.unitPrice, 0);

    // ====== BRANCH inventory ======
    const filteredBranchInventory = mockInventory.filter(inv => {
        const product = mockProducts.find(p => p.id === inv.productId);
        if (!product) return false;
        const matchesBranch = selectedBranch === 'all' || inv.branchId === selectedBranch;
        const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
        const matchesSearch =
            searchTerm === '' ||
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.barcode.includes(searchTerm);
        return matchesBranch && matchesCategory && matchesSearch;
    });

    const branchTotalItems = filteredBranchInventory.reduce((sum, inv) => sum + inv.quantity, 0);
    const branchTotalValue = filteredBranchInventory.reduce((sum, inv) => sum + inv.quantity * inv.unitPrice, 0);
    const branchLowStockItems = filteredBranchInventory.filter(inv => inv.quantity < 20);
    const branchesWithStock = new Set(filteredBranchInventory.map(inv => inv.branchId)).size;

    // Group inventory by branch for the summary view
    const inventoryByBranch = activeBranches.map(branch => {
        const branchInv = mockInventory.filter(inv => inv.branchId === branch.id);
        const branchTotal = branchInv.reduce((sum, inv) => sum + inv.quantity, 0);
        const branchValue = branchInv.reduce((sum, inv) => sum + inv.quantity * inv.unitPrice, 0);
        const branchLowStock = branchInv.filter(inv => inv.quantity < 20).length;
        return {
            branch,
            totalItems: branchTotal,
            totalValue: branchValue,
            lowStockCount: branchLowStock,
            itemCount: branchInv.length,
        };
    });

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            alimento: 'bg-green-100 text-green-700',
            medicamento: 'bg-red-100 text-red-700',
            enxoval: 'bg-blue-100 text-blue-700',
            outro: 'bg-gray-100 text-gray-700',
        };
        return colors[category] || colors.outro;
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            alimento: 'Alimento',
            medicamento: 'Medicamento',
            enxoval: 'Enxoval',
            outro: 'Outro',
        };
        return labels[category] || category;
    };

    // Clear branch filter when switching tabs
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setSearchTerm('');
        setFilterCategory('all');
        setSelectedBranch('all');
    };

    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventários</h1>
                <p className="text-gray-600">
                    Controle de estoque da Central e de cada unidade
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="w-full md:w-auto">
                    <TabsTrigger value="central" className="flex items-center gap-2">
                        <Landmark className="size-4" />
                        Estoque Central
                        <Badge className="bg-gray-200 text-gray-700 ml-1">{mockCentralInventory.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="branches" className="flex items-center gap-2">
                        <Building2 className="size-4" />
                        Estoque Filiais
                        <Badge className="bg-gray-200 text-gray-700 ml-1">{mockInventory.length}</Badge>
                    </TabsTrigger>
                </TabsList>

                {/* ========= CENTRAL TAB ========= */}
                <TabsContent value="central">
                    <div className="space-y-6 mt-4">
                        {/* Central Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="border-l-4 border-l-indigo-500">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Itens na Central</CardTitle>
                                    <Package className="size-4 text-indigo-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{centralTotalItems}</div>
                                    <p className="text-xs text-gray-600 mt-1">Unidades disponíveis para envio</p>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-l-indigo-500">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Valor do Estoque</CardTitle>
                                    <BarChart3 className="size-4 text-indigo-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-indigo-600">
                                        R$ {centralTotalValue.toFixed(2)}
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">Capital imobilizado na Central</p>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-l-indigo-500">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Tipos de Produto</CardTitle>
                                    <Archive className="size-4 text-indigo-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-indigo-600">{filteredCentralInventory.length}</div>
                                    <p className="text-xs text-gray-600 mt-1">Produtos em estoque</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Central Filters */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Buscar por nome, descrição ou código de barras..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                                <SelectTrigger className="w-full md:w-48">
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

                        {/* Central Inventory Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Landmark className="size-5" />
                                    Estoque da Central
                                </CardTitle>
                                <CardDescription>
                                    Produtos disponíveis no depósito central para envio às filiais
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Produto</TableHead>
                                            <TableHead>Categoria</TableHead>
                                            <TableHead className="text-right">Qtd. Disponível</TableHead>
                                            <TableHead className="text-right">Preço Unit.</TableHead>
                                            <TableHead className="text-right">Valor Total</TableHead>
                                            <TableHead>Atualização</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredCentralInventory.map(inv => {
                                            const product = mockProducts.find(p => p.id === inv.productId);
                                            const itemValue = inv.quantity * inv.unitPrice;

                                            return (
                                                <TableRow key={inv.id}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{product?.name}</p>
                                                            <p className="text-xs text-gray-500">{product?.description}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getCategoryColor(product?.category || 'outro')}>
                                                            {getCategoryLabel(product?.category || 'outro')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className="font-bold text-indigo-600">
                                                            {inv.quantity} {product?.unit}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        R$ {inv.unitPrice.toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className="font-medium text-green-600">
                                                            R$ {itemValue.toFixed(2)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                                            <TrendingDown className="size-3" />
                                                            {new Date(inv.lastUpdated).toLocaleDateString('pt-BR')}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>

                                {filteredCentralInventory.length === 0 && (
                                    <div className="py-12 text-center">
                                        <Archive className="size-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum item encontrado</h3>
                                        <p className="text-gray-600">
                                            Ajuste os filtros ou cadastre novos produtos via Compras
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* ========= BRANCHES TAB ========= */}
                <TabsContent value="branches">
                    <div className="space-y-6 mt-4">
                        {/* Branch Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
                                    <Package className="size-4 text-gray-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{branchTotalItems}</div>
                                    <p className="text-xs text-gray-600 mt-1">Unidades nas filiais</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                                    <BarChart3 className="size-4 text-blue-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-600">
                                        R$ {branchTotalValue.toFixed(2)}
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">Capital nas filiais</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
                                    <AlertCircle className="size-4 text-orange-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-orange-600">{branchLowStockItems.length}</div>
                                    <p className="text-xs text-gray-600 mt-1">Itens abaixo do mínimo</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Filiais</CardTitle>
                                    <Building2 className="size-4 text-purple-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-purple-600">{branchesWithStock}</div>
                                    <p className="text-xs text-gray-600 mt-1">Com estoque ativo</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Branch overview cards (only when "all" is selected) */}
                        {selectedBranch === 'all' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {inventoryByBranch.map(({ branch, totalItems: bTotal, totalValue: bValue, lowStockCount, itemCount }) => (
                                    <Card
                                        key={branch.id}
                                        className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-blue-500"
                                        onClick={() => setSelectedBranch(branch.id)}
                                    >
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-semibold">{branch.name}</CardTitle>
                                            <CardDescription className="text-xs">{branch.code} • {branch.address}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Produtos:</span>
                                                    <span className="font-medium">{itemCount} tipos</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Qtd Total:</span>
                                                    <span className="font-medium">{bTotal} un</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Valor:</span>
                                                    <span className="font-medium text-blue-600">R$ {bValue.toFixed(2)}</span>
                                                </div>
                                                {lowStockCount > 0 && (
                                                    <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 p-1.5 rounded">
                                                        <AlertCircle className="size-3" />
                                                        {lowStockCount} item(ns) com estoque baixo
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Branch Filters */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Buscar por nome, descrição ou código de barras..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                                <SelectTrigger className="w-full md:w-56">
                                    <Building2 className="size-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas as Filiais</SelectItem>
                                    {activeBranches.map(branch => (
                                        <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                                <SelectTrigger className="w-full md:w-48">
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

                        {/* Branch Inventory Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Archive className="size-5" />
                                    Estoque das Filiais
                                    {selectedBranch !== 'all' && (
                                        <Badge className="bg-blue-100 text-blue-700 ml-2">
                                            {activeBranches.find(b => b.id === selectedBranch)?.name}
                                        </Badge>
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    {filteredBranchInventory.length} registro(s) encontrado(s)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Filial</TableHead>
                                            <TableHead>Produto</TableHead>
                                            <TableHead>Categoria</TableHead>
                                            <TableHead className="text-right">Qtd. Disponível</TableHead>
                                            <TableHead className="text-right">Preço Unit.</TableHead>
                                            <TableHead className="text-right">Valor Total</TableHead>
                                            <TableHead>Atualização</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredBranchInventory.map(inv => {
                                            const product = mockProducts.find(p => p.id === inv.productId);
                                            const branch = activeBranches.find(b => b.id === inv.branchId);
                                            const itemValue = inv.quantity * inv.unitPrice;
                                            const isLowStock = inv.quantity < 20;

                                            return (
                                                <TableRow key={inv.id} className={isLowStock ? 'bg-orange-50/50' : ''}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium text-sm">{branch?.name}</p>
                                                            <p className="text-xs text-gray-500">{branch?.code}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{product?.name}</p>
                                                            <p className="text-xs text-gray-500">{product?.description}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getCategoryColor(product?.category || 'outro')}>
                                                            {getCategoryLabel(product?.category || 'outro')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className={`font-bold ${isLowStock ? 'text-orange-600' : 'text-blue-600'}`}>
                                                            {inv.quantity} {product?.unit}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        R$ {inv.unitPrice.toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className="font-medium text-green-600">
                                                            R$ {itemValue.toFixed(2)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                                            <TrendingDown className="size-3" />
                                                            {new Date(inv.lastUpdated).toLocaleDateString('pt-BR')}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {isLowStock ? (
                                                            <div className="flex items-center gap-1">
                                                                <AlertCircle className="size-4 text-orange-500" />
                                                                <span className="text-xs text-orange-600 font-medium">Baixo</span>
                                                            </div>
                                                        ) : (
                                                            <Badge className="bg-green-100 text-green-700">OK</Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>

                                {filteredBranchInventory.length === 0 && (
                                    <div className="py-12 text-center">
                                        <Archive className="size-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum item encontrado</h3>
                                        <p className="text-gray-600">
                                            Tente ajustar os filtros de busca para encontrar itens no inventário
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
