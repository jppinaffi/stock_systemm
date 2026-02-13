import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Send, Plus, CheckCircle, XCircle, Clock, Truck, ArrowRight, Inbox, AlertTriangle, Search } from 'lucide-react';
import { mockOrders, mockProducts, mockBranches, mockBranchAuthorizations, mockCentralInventory, mockDirectShipments } from '../data/mockData';
import type { DirectShipment } from '../data/mockData';
import type { User, Order } from '../types';

// ── Helpers ──────────────────────────────────────────────
const fmt = (d: Date) => new Date(d).toLocaleDateString('pt-BR');
const findProduct = (id: string) => mockProducts.find(p => p.id === id);
const findBranch = (id: string) => mockBranches.find(b => b.id === id);
const getCentralStock = (pid: string) => mockCentralInventory.find(i => i.productId === pid)?.quantity ?? 0;

const STATUS_CFG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive'; icon: typeof Clock; }> = {
  pendente: { label: 'Pendente', variant: 'secondary', icon: Clock },
  aprovado: { label: 'Aprovado', variant: 'default', icon: CheckCircle },
  rejeitado: { label: 'Rejeitado', variant: 'destructive', icon: XCircle },
  enviado: { label: 'Enviado', variant: 'default', icon: Send },
  recebido: { label: 'Recebido', variant: 'default', icon: CheckCircle },
  em_transito: { label: 'Em Trânsito', variant: 'secondary', icon: Truck },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.pendente;
  const Icon = cfg.icon;
  const extra = status === 'em_transito' ? 'bg-blue-100 text-blue-700' : '';
  return (
    <Badge variant={cfg.variant} className={`flex items-center gap-1 w-fit ${extra}`}>
      <Icon className="size-3" />{cfg.label}
    </Badge>
  );
}

function SummaryCard({ label, value, icon: Icon, color, border }: {
  label: string; value: number; icon: typeof Clock; color: string; border: string;
}) {
  return (
    <Card className={`border-l-4 ${border}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className={`size-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: typeof Clock; title: string; description: string }) {
  return (
    <div className="text-center py-12">
      <Icon className="size-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

// ── OrderRow (shared between admin requests tab & branch view) ──
function OrderRow({ order, showBranch, showActions, onApprove, onReject }: {
  order: Order; showBranch?: boolean; showActions?: boolean;
  onApprove?: (id: string) => void; onReject?: (id: string) => void;
}) {
  const product = findProduct(order.productId);
  const branch = showBranch ? findBranch(order.branchId) : null;
  return (
    <TableRow>
      <TableCell>{fmt(order.createdAt)}</TableCell>
      {showBranch && (
        <TableCell>
          <p className="font-medium">{branch?.name}</p>
          <p className="text-xs text-gray-600">{branch?.code}</p>
        </TableCell>
      )}
      <TableCell>
        <p className="font-medium">{product?.name}</p>
        {order.justification && order.status !== 'rejeitado' && (
          <p className="text-xs text-orange-600">⚠️ Item não homologado</p>
        )}
      </TableCell>
      <TableCell className="text-right">{order.quantity} {product?.unit}</TableCell>
      <TableCell>
        <StatusBadge status={order.status} />
        {order.justification && order.status === 'rejeitado' && (
          <p className="text-xs text-gray-600 mt-1">{order.justification}</p>
        )}
      </TableCell>
      {showActions && (
        <TableCell className="text-right">
          {order.status === 'pendente' && (
            <div className="flex gap-2 justify-end">
              <Button size="sm" onClick={() => onApprove?.(order.id)}>
                <CheckCircle className="size-4 mr-1" />Aprovar
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onReject?.(order.id)}>
                <XCircle className="size-4 mr-1" />Rejeitar
              </Button>
            </div>
          )}
          {order.status === 'aprovado' && order.approvedAt && (
            <span className="text-xs text-gray-600">Aprovado em {fmt(order.approvedAt)}</span>
          )}
        </TableCell>
      )}
    </TableRow>
  );
}

// ── Main Component ───────────────────────────────────────
export function OrdersView({ currentUser }: { currentUser: User }) {
  const isCentral = currentUser.role === 'admin';
  const branchId = currentUser.branchId;

  const [orders, setOrders] = useState(isCentral ? mockOrders : mockOrders.filter(o => o.branchId === branchId));
  const [shipments, setShipments] = useState<DirectShipment[]>(mockDirectShipments);
  const [activeTab, setActiveTab] = useState(isCentral ? 'send' : 'requests');

  // Branch request form
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({ productId: '', quantity: '', justification: '' });

  // Admin send form
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [sendForm, setSendForm] = useState({ branchId: '', productId: '', quantity: '', notes: '' });

  // Barcode lookup
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeResult, setBarcodeResult] = useState<{ found: boolean; name: string; inCentral: boolean } | null>(null);
  const [confirmNotInCentral, setConfirmNotInCentral] = useState(false);

  const notInCentral = barcodeResult?.found === true && !barcodeResult.inCentral;

  // ── Handlers ─────────────────────────────────────────
  const handleBarcodeLookup = () => {
    if (!barcodeInput.trim()) return;
    const product = mockProducts.find(p => p.barcode === barcodeInput.trim());
    if (product) {
      const inCentral = mockCentralInventory.some(inv => inv.productId === product.id);
      setBarcodeResult({ found: true, name: product.name, inCentral });
      setSendForm(prev => ({ ...prev, productId: product.id }));
    } else {
      setBarcodeResult({ found: false, name: '', inCentral: false });
      setSendForm(prev => ({ ...prev, productId: '' }));
    }
    setConfirmNotInCentral(false);
  };

  const handleProductSelect = (productId: string) => {
    setSendForm(prev => ({ ...prev, productId }));
    const product = findProduct(productId);
    if (product) {
      setBarcodeInput(product.barcode);
      setBarcodeResult({ found: true, name: product.name, inCentral: true });
    }
    setConfirmNotInCentral(false);
  };

  const resetSendForm = () => {
    setSendForm({ branchId: '', productId: '', quantity: '', notes: '' });
    setBarcodeInput('');
    setBarcodeResult(null);
    setConfirmNotInCentral(false);
  };

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShipments([{
      id: `ship-${Date.now()}`, branchId: sendForm.branchId, productId: sendForm.productId,
      quantity: parseFloat(sendForm.quantity), sentBy: currentUser.id, status: 'em_transito',
      sentAt: new Date(), notes: sendForm.notes || undefined,
    }, ...shipments]);
    setIsSendDialogOpen(false);
    resetSendForm();
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder: Order = {
      id: `order-${Date.now()}`, branchId: branchId!, productId: requestForm.productId,
      quantity: parseFloat(requestForm.quantity), requestedBy: currentUser.id,
      status: 'pendente', justification: requestForm.justification || undefined, createdAt: new Date(),
    };
    setOrders([newOrder, ...orders]);
    setIsRequestDialogOpen(false);
    setRequestForm({ productId: '', quantity: '', justification: '' });
    const isAuthorized = mockBranchAuthorizations.some(
      a => a.branchId === branchId && a.productId === requestForm.productId && a.authorized
    );
    if (!isAuthorized) alert('Atenção: Este item não está homologado para sua filial.');
  };

  const handleApprove = (id: string) => setOrders(orders.map(o =>
    o.id === id ? { ...o, status: 'aprovado' as const, approvedBy: currentUser.id, approvedAt: new Date() } : o
  ));

  const handleReject = (id: string) => {
    const justification = prompt('Motivo da rejeição:');
    if (justification) setOrders(orders.map(o => o.id === id ? { ...o, status: 'rejeitado' as const, justification } : o));
  };

  // ── Derived data ─────────────────────────────────────
  const pendingCount = orders.filter(o => o.status === 'pendente').length;
  const approvedCount = orders.filter(o => o.status === 'aprovado').length;
  const rejectedCount = orders.filter(o => o.status === 'rejeitado').length;
  const inTransitCount = shipments.filter(s => s.status === 'em_transito').length;
  const activeBranches = mockBranches.filter(b => b.active);
  const authorizedProducts = mockBranchAuthorizations.filter(a => a.branchId === branchId && a.authorized).map(a => a.productId);
  const needsJustification = requestForm.productId && !authorizedProducts.includes(requestForm.productId);
  const centralStock = sendForm.productId ? getCentralStock(sendForm.productId) : 0;

  // ── JSX ──────────────────────────────────────────────
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isCentral ? 'Envios e Solicitações' : 'Meus Pedidos'}
          </h1>
          <p className="text-gray-600">
            {isCentral ? 'Envie produtos para filiais e gerencie solicitações recebidas' : 'Solicitação de reposição de itens à Central'}
          </p>
        </div>

        {/* Branch: new request dialog */}
        {!isCentral && (
          <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="size-4 mr-2" />Novo Pedido</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Pedido à Central</DialogTitle>
                <DialogDescription>Solicite a reposição de itens</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Produto</Label>
                  <Select value={requestForm.productId} onValueChange={v => setRequestForm({ ...requestForm, productId: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione um produto" /></SelectTrigger>
                    <SelectContent>
                      {mockProducts.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} {!authorizedProducts.includes(p.id) && '⚠️ Não homologado'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {needsJustification && <p className="text-xs text-orange-600">⚠️ Item não homologado. Justificativa obrigatória.</p>}
                </div>
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input type="number" step="0.01" value={requestForm.quantity}
                    onChange={e => setRequestForm({ ...requestForm, quantity: e.target.value })} placeholder="0" required />
                </div>
                {needsJustification && (
                  <div className="space-y-2">
                    <Label>Justificativa *</Label>
                    <Textarea value={requestForm.justification}
                      onChange={e => setRequestForm({ ...requestForm, justification: e.target.value })}
                      placeholder="Explique por que este item não homologado é necessário" required />
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">Enviar Pedido</Button>
                  <Button type="button" variant="outline" onClick={() => setIsRequestDialogOpen(false)}>Cancelar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* ══════════ ADMIN VIEW ══════════ */}
      {isCentral ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SummaryCard label="Envios Diretos" value={shipments.length} icon={Send} color="text-blue-600" border="border-l-blue-500" />
            <SummaryCard label="Em Trânsito" value={inTransitCount} icon={Truck} color="text-cyan-600" border="border-l-cyan-500" />
            <SummaryCard label="Solicitações Pendentes" value={pendingCount} icon={Clock} color="text-orange-600" border="border-l-orange-500" />
            <SummaryCard label="Aprovados" value={approvedCount} icon={CheckCircle} color="text-green-600" border="border-l-green-500" />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="send" className="flex items-center gap-2"><Send className="size-4" />Enviar Produtos</TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <Inbox className="size-4" />Solicitações
                {pendingCount > 0 && <Badge className="bg-orange-100 text-orange-700 ml-1">{pendingCount}</Badge>}
              </TabsTrigger>
            </TabsList>

            {/* ── Send tab ── */}
            <TabsContent value="send">
              <div className="space-y-6 mt-4">
                <div className="flex justify-end">
                  <Dialog open={isSendDialogOpen} onOpenChange={(open) => { setIsSendDialogOpen(open); if (!open) resetSendForm(); }}>
                    <DialogTrigger asChild>
                      <Button><Send className="size-4 mr-2" />Novo Envio Direto</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Enviar Produtos para Filial</DialogTitle>
                        <DialogDescription>Envie produtos diretamente do estoque da Central para uma filial</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSendSubmit} className="space-y-4">
                        {/* Filial */}
                        <div className="space-y-2">
                          <Label>Filial de Destino</Label>
                          <Select value={sendForm.branchId} onValueChange={v => setSendForm({ ...sendForm, branchId: v })}>
                            <SelectTrigger><SelectValue placeholder="Selecione a filial" /></SelectTrigger>
                            <SelectContent>
                              {activeBranches.map(b => <SelectItem key={b.id} value={b.id}>{b.name} ({b.code})</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Barcode */}
                        <div className="space-y-2">
                          <Label>Código de Barras</Label>
                          <div className="flex gap-2">
                            <Input placeholder="Digite ou escaneie o código de barras" value={barcodeInput}
                              onChange={e => { setBarcodeInput(e.target.value); setBarcodeResult(null); setConfirmNotInCentral(false); }}
                              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleBarcodeLookup(); } }} />
                            <Button type="button" variant="outline" onClick={handleBarcodeLookup}><Search className="size-4" /></Button>
                          </div>
                          {barcodeResult && (
                            <div className={`text-xs p-2 rounded flex items-center gap-2 ${!barcodeResult.found ? 'bg-red-50 text-red-700 border border-red-200'
                                : barcodeResult.inCentral ? 'bg-green-50 text-green-700 border border-green-200'
                                  : 'bg-orange-50 text-orange-700 border border-orange-200'
                              }`}>
                              {!barcodeResult.found
                                ? <><XCircle className="size-3" /> Nenhum produto encontrado para este código</>
                                : <><CheckCircle className="size-3" /> {barcodeResult.name}{!barcodeResult.inCentral && ' — não está no estoque da Central'}</>
                              }
                            </div>
                          )}
                        </div>
                        {/* Dropdown de produtos do estoque central */}
                        <div className="space-y-2">
                          <Label>Ou selecione do inventário da Central</Label>
                          <Select value={sendForm.productId} onValueChange={handleProductSelect}>
                            <SelectTrigger><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
                            <SelectContent>
                              {mockCentralInventory.map(inv => {
                                const p = findProduct(inv.productId);
                                return <SelectItem key={inv.productId} value={inv.productId}>{p?.name} — Disp.: {inv.quantity} {p?.unit}</SelectItem>;
                              })}
                            </SelectContent>
                          </Select>
                          {centralStock > 0 && <p className="text-xs text-blue-600">Estoque na Central: {centralStock} un. disponíveis</p>}
                        </div>
                        {/* Warning: não está no inventário central */}
                        {notInCentral && (
                          <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 space-y-2">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="size-5 text-amber-600 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-amber-800">Produto não registrado no estoque da Central</p>
                                <p className="text-xs text-amber-700 mt-1">
                                  <strong>{barcodeResult?.name}</strong> existe no catálogo mas não possui estoque registrado. Deseja enviar mesmo assim?
                                </p>
                              </div>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={confirmNotInCentral}
                                onChange={e => setConfirmNotInCentral(e.target.checked)} className="rounded border-amber-400" />
                              <span className="text-xs text-amber-800 font-medium">Sim, desejo enviar mesmo sem estoque registrado</span>
                            </label>
                          </div>
                        )}
                        {/* Quantidade */}
                        <div className="space-y-2">
                          <Label>Quantidade</Label>
                          <Input type="number" step="1" min="1"
                            max={!notInCentral && centralStock > 0 ? centralStock : undefined}
                            value={sendForm.quantity}
                            onChange={e => setSendForm({ ...sendForm, quantity: e.target.value })} placeholder="0" required />
                        </div>
                        {/* Observação */}
                        <div className="space-y-2">
                          <Label>Observação (opcional)</Label>
                          <Textarea value={sendForm.notes} onChange={e => setSendForm({ ...sendForm, notes: e.target.value })}
                            placeholder="Ex: Reposição programada, envio urgente, etc." />
                        </div>
                        {/* Botões */}
                        <div className="flex gap-2 pt-4">
                          <Button type="submit" className="flex-1"
                            disabled={!sendForm.branchId || !sendForm.productId || !sendForm.quantity || (notInCentral && !confirmNotInCentral)}>
                            <Send className="size-4 mr-2" />Confirmar Envio
                          </Button>
                          <Button type="button" variant="outline" onClick={() => { setIsSendDialogOpen(false); resetSendForm(); }}>Cancelar</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Shipments table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Truck className="size-5" />Histórico de Envios Diretos</CardTitle>
                    <CardDescription>Envios realizados diretamente pela Central</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {shipments.length === 0 ? (
                      <EmptyState icon={Send} title="Nenhum envio registrado" description='Use "Novo Envio Direto" para enviar produtos às filiais' />
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Filial Destino</TableHead>
                            <TableHead>Produto</TableHead>
                            <TableHead className="text-right">Qtde</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Obs.</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {shipments.map(s => {
                            const product = findProduct(s.productId);
                            const branch = findBranch(s.branchId);
                            return (
                              <TableRow key={s.id}>
                                <TableCell>{fmt(s.sentAt)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <ArrowRight className="size-4 text-blue-500" />
                                    <div>
                                      <p className="font-medium">{branch?.name}</p>
                                      <p className="text-xs text-gray-600">{branch?.code}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">{product?.name}</TableCell>
                                <TableCell className="text-right">{s.quantity} {product?.unit}</TableCell>
                                <TableCell>
                                  <StatusBadge status={s.status} />
                                  {s.receivedAt && <p className="text-xs text-gray-500 mt-1">Recebido em {fmt(s.receivedAt)}</p>}
                                </TableCell>
                                <TableCell><span className="text-xs text-gray-600">{s.notes || '—'}</span></TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ── Requests tab ── */}
            <TabsContent value="requests">
              <div className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Inbox className="size-5" />Solicitações das Filiais</CardTitle>
                    <CardDescription>Pedidos de reposição enviados pelas unidades</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {orders.length === 0 ? (
                      <EmptyState icon={Inbox} title="Nenhuma solicitação" description="Quando as filiais fizerem pedidos, eles aparecerão aqui" />
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Filial</TableHead>
                            <TableHead>Produto</TableHead>
                            <TableHead className="text-right">Qtde</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map(o => <OrderRow key={o.id} order={o} showBranch showActions onApprove={handleApprove} onReject={handleReject} />)}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        /* ══════════ BRANCH VIEW ══════════ */
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard label="Pendentes" value={pendingCount} icon={Clock} color="text-orange-600" border="border-l-orange-500" />
            <SummaryCard label="Aprovados" value={approvedCount} icon={CheckCircle} color="text-green-600" border="border-l-green-500" />
            <SummaryCard label="Rejeitados" value={rejectedCount} icon={XCircle} color="text-red-600" border="border-l-red-500" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Send className="size-5" />Meus Pedidos</CardTitle>
              <CardDescription>Suas solicitações de reposição à Central</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <EmptyState icon={Send} title="Nenhum pedido encontrado" description="Comece criando seu primeiro pedido à Central" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Qtde</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map(o => <OrderRow key={o.id} order={o} />)}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}