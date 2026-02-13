import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Badge } from './ui/badge';
import { Truck, Fuel, TrendingUp, Anchor, Ship, Clock } from 'lucide-react';
import { mockRefuelings, mockVehicles, mockBoats, mockBoatRefuelings } from '../data/mockData';
import type { User } from '../types';

interface RefuelingViewProps {
  currentUser: User;
}

export function RefuelingView({ currentUser }: RefuelingViewProps) {
  const isCentral = currentUser.role === 'admin';
  const branchId = currentUser.branchId || 'branch-1';

  // Vehicle data
  const vehicles = isCentral ? mockVehicles : mockVehicles.filter(v => v.branchId === branchId);
  const refuelings = isCentral ? mockRefuelings : mockRefuelings.filter(r => r.branchId === branchId);

  // Boat data
  const boats = isCentral ? mockBoats : mockBoats.filter(b => b.branchId === branchId);
  const boatRefuelings = isCentral ? mockBoatRefuelings : mockBoatRefuelings.filter(r => r.branchId === branchId);

  // Vehicle summaries
  const totalVehicleRefuelings = refuelings.length;
  const totalVehicleLiters = refuelings.reduce((sum, r) => sum + r.liters, 0);
  const totalVehicleValue = refuelings.reduce((sum, r) => sum + r.totalPrice, 0);

  // Boat summaries
  const totalBoatRefuelings = boatRefuelings.length;
  const totalBoatLiters = boatRefuelings.reduce((sum, r) => sum + r.liters, 0);
  const totalBoatValue = boatRefuelings.reduce((sum, r) => sum + r.totalPrice, 0);

  // Combined summaries
  const totalLiters = totalVehicleLiters + totalBoatLiters;
  const totalValue = totalVehicleValue + totalBoatValue;

  const [activeTab, setActiveTab] = useState('vehicles');

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Controle de Abastecimento</h1>
        <p className="text-gray-600">Gestão de combustível de veículos e diesel de embarcações</p>
      </div>

      {/* Combined Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abastecimentos</CardTitle>
            <Fuel className="size-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVehicleRefuelings + totalBoatRefuelings}</div>
            <p className="text-xs text-gray-600 mt-1">Registros totais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Litros Consumidos</CardTitle>
            <TrendingUp className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalLiters.toFixed(0)}L</div>
            <p className="text-xs text-gray-600 mt-1">
              {totalVehicleLiters.toFixed(0)}L veículos • {totalBoatLiters.toFixed(0)}L embarcações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
            <Fuel className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {totalValue.toFixed(2)}</div>
            <p className="text-xs text-gray-600 mt-1">Veículos + Embarcações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Frota</CardTitle>
            <Ship className="size-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {vehicles.length + boats.length}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {vehicles.length} veículo(s) • {boats.length} motor(es)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Vehicles and Boats */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <Truck className="size-4" />
            Veículos
            <Badge className="bg-gray-200 text-gray-700 ml-1">{totalVehicleRefuelings}</Badge>
          </TabsTrigger>
          <TabsTrigger value="boats" className="flex items-center gap-2">
            <Anchor className="size-4" />
            Embarcações (Diesel)
            <Badge className="bg-gray-200 text-gray-700 ml-1">{totalBoatRefuelings}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* ========= VEHICLES TAB ========= */}
        <TabsContent value="vehicles">
          <div className="space-y-6 mt-4">
            {/* Vehicle Cards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="size-5" />
                  Veículos
                </CardTitle>
                <CardDescription>Frota disponível para controle de gasolina/etanol</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {vehicles.map(vehicle => (
                    <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Truck className="size-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{vehicle.plate}</h3>
                          <p className="text-sm text-gray-600">{vehicle.model}</p>
                        </div>
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-600">Odômetro:</p>
                        <p className="font-medium">{vehicle.odometer.toLocaleString()} km</p>
                      </div>
                    </div>
                  ))}
                  {vehicles.length === 0 && (
                    <div className="col-span-3 text-center py-8 text-gray-500">
                      Nenhum veículo cadastrado nesta filial
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Refueling History */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Abastecimentos — Veículos</CardTitle>
                <CardDescription>Registro de combustível e quilometragem</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Veículo</TableHead>
                      <TableHead className="text-right">Litros</TableHead>
                      <TableHead className="text-right">R$/L</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Odômetro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {refuelings.map(refueling => {
                      const vehicle = mockVehicles.find(v => v.id === refueling.vehicleId);
                      return (
                        <TableRow key={refueling.id}>
                          <TableCell>
                            {new Date(refueling.fueledAt).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{vehicle?.plate}</p>
                              <p className="text-xs text-gray-600">{vehicle?.model}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{refueling.liters}L</TableCell>
                          <TableCell className="text-right">R$ {refueling.pricePerLiter.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <span className="font-medium text-green-600">
                              R$ {refueling.totalPrice.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">{refueling.odometer.toLocaleString()} km</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {refuelings.length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    Nenhum abastecimento de veículo registrado
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ========= BOATS TAB ========= */}
        <TabsContent value="boats">
          <div className="space-y-6 mt-4">
            {/* Boat summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-cyan-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Abastecimentos Diesel</CardTitle>
                  <Anchor className="size-4 text-cyan-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalBoatRefuelings}</div>
                  <p className="text-xs text-gray-600 mt-1">Registros de embarcações</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-cyan-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Diesel Consumido</CardTitle>
                  <TrendingUp className="size-4 text-cyan-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-cyan-600">{totalBoatLiters.toFixed(0)}L</div>
                  <p className="text-xs text-gray-600 mt-1">Total de diesel</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-cyan-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Custo Diesel</CardTitle>
                  <Fuel className="size-4 text-cyan-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-cyan-600">R$ {totalBoatValue.toFixed(2)}</div>
                  <p className="text-xs text-gray-600 mt-1">Investimento em diesel</p>
                </CardContent>
              </Card>
            </div>

            {/* Boat/Engine Cards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="size-5" />
                  Motores / Geradores
                </CardTitle>
                <CardDescription>Motores de embarcações e geradores registrados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {boats.map(boat => (
                    <div key={boat.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-cyan-100 p-2 rounded-lg">
                          <Anchor className="size-5 text-cyan-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">{boat.name}</h3>
                          <p className="text-xs text-gray-600">{boat.model}</p>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Registro:</span>
                          <span className="font-mono text-xs">{boat.registration}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Horímetro:</span>
                          <div className="flex items-center gap-1">
                            <Clock className="size-3 text-gray-500" />
                            <span className="font-medium">{boat.engineHours.toLocaleString()}h</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {boats.length === 0 && (
                    <div className="col-span-4 text-center py-8 text-gray-500">
                      Nenhum motor/embarcação cadastrado nesta filial
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Boat Refueling History */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Abastecimentos — Diesel (Embarcações)</CardTitle>
                <CardDescription>Registro de diesel consumido por motores e geradores</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Motor / Equipamento</TableHead>
                      <TableHead className="text-right">Litros (Diesel)</TableHead>
                      <TableHead className="text-right">R$/L</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Horímetro</TableHead>
                      <TableHead>Observação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {boatRefuelings.map(ref => {
                      const boat = mockBoats.find(b => b.id === ref.boatId);
                      return (
                        <TableRow key={ref.id}>
                          <TableCell>
                            {new Date(ref.fueledAt).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{boat?.name}</p>
                              <p className="text-xs text-gray-600">{boat?.model}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-medium">{ref.liters}L</span>
                          </TableCell>
                          <TableCell className="text-right">R$ {ref.pricePerLiter.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <span className="font-medium text-green-600">
                              R$ {ref.totalPrice.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Clock className="size-3 text-gray-500" />
                              {ref.engineHours.toLocaleString()}h
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-gray-600">{ref.notes || '—'}</span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {boatRefuelings.length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    Nenhum abastecimento de embarcação registrado
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
