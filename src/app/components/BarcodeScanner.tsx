import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, Camera, ZoomIn, ZoomOut, Zap, ZapOff } from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";

interface BarcodeScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onClose: () => void;
}

export function BarcodeScanner({ onScanSuccess, onClose }: BarcodeScannerProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const regionId = "barcode-scanner-region";

    const [zoomRange, setZoomRange] = useState<{ min: number; max: number; step: number } | null>(null);
    const [currentZoom, setCurrentZoom] = useState<number>(1);
    const [hasTorch, setHasTorch] = useState(false);
    const [isTorchOn, setIsTorchOn] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const scanner = new Html5Qrcode(regionId);
        scannerRef.current = scanner;

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };

        scanner
            .start(
                { facingMode: "environment" },
                config,
                (decodedText) => {
                    onScanSuccess(decodedText);
                    handleStop();
                },
                () => {
                    // Failure callback is too noisy
                }
            )
            .then(() => {
                // Once started, check for capabilities like zoom and torch
                try {
                    const track = scanner.getRunningTrackCapabilities() as any;

                    // Check for Zoom support
                    if (track.zoom) {
                        setZoomRange({
                            min: track.zoom.min,
                            max: track.zoom.max,
                            step: track.zoom.step || 0.1
                        });
                        setCurrentZoom(track.zoom.current || 1);
                    }

                    // Check for Torch support
                    if (track.torch) {
                        setHasTorch(true);
                    }
                } catch (e) {
                    console.warn("Advanced camera controls not supported on this browser/device", e);
                }
            })
            .catch((err) => {
                console.error("Error starting scanner:", err);
            });

        return () => {
            if (scanner.isScanning) {
                scanner.stop().catch(e => console.error("Error stopping on unmount", e));
            }
        };
    }, [onScanSuccess]);

    const handleZoomChange = async (value: number[]) => {
        const zoomValue = value[0];
        setCurrentZoom(zoomValue);
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.applyVideoConstraints({
                    advanced: [{ zoom: zoomValue } as any]
                });
            } catch (err) {
                console.error("Error applying zoom:", err);
            }
        }
    };

    const toggleTorch = async () => {
        if (scannerRef.current && scannerRef.current.isScanning && hasTorch) {
            try {
                const newTorchState = !isTorchOn;
                await scannerRef.current.applyVideoConstraints({
                    advanced: [{ torch: newTorchState } as any]
                });
                setIsTorchOn(newTorchState);
            } catch (err) {
                console.error("Error toggling torch:", err);
            }
        }
    };

    const handleStop = async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop();
            } catch (err) {
                console.error("Error stopping scanner:", err);
            }
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-50 p-2 rounded-lg">
                            <Camera className="size-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Escanear Código</h3>
                            <p className="text-xs text-gray-500 font-normal">Ajuste o zoom se necessário</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {hasTorch && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleTorch}
                                className={`rounded-full ${isTorchOn ? 'bg-yellow-50 text-yellow-600' : 'text-gray-500'}`}
                            >
                                {isTorchOn ? <Zap className="size-5 fill-current" /> : <ZapOff className="size-5" />}
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={handleStop} className="rounded-full hover:bg-gray-100">
                            <X className="size-5 text-gray-500" />
                        </Button>
                    </div>
                </div>

                {/* Scanner Area */}
                <div className="relative aspect-square w-full bg-black flex items-center justify-center overflow-hidden">
                    <div id={regionId} className="w-full h-full object-cover [&_video]:object-cover" />

                    {/* Overlay scanning frame */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-64 h-64 relative">
                            {/* Corner Accents */}
                            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>

                            {/* Scanning line animation */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/80 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[scan_2s_linear_infinite]"></div>
                        </div>
                    </div>
                </div>

                {/* Controls Overlay (Inside Scanner Area) */}
                {zoomRange && (
                    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-4/5 bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center gap-4">
                            <ZoomOut className="size-4 text-white shrink-0" />
                            <Slider
                                value={[currentZoom]}
                                min={zoomRange.min}
                                max={zoomRange.max}
                                step={zoomRange.step}
                                onValueChange={handleZoomChange}
                                className="flex-1"
                            />
                            <ZoomIn className="size-4 text-white shrink-0" />
                        </div>
                        <p className="text-[10px] text-white/70 text-center mt-2 font-medium">Zoom: {currentZoom.toFixed(1)}x</p>
                    </div>
                )}

                {/* Hints */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                        <p className="text-xs text-white font-medium">Buscando código...</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 text-center bg-white border-t space-y-3">
                    {!zoomRange && (
                        <p className="text-[10px] text-gray-400">
                            Nota: Zoom digital não suportado neste navegador/dispositivo (iOS limita controles manuais de câmera via Web).
                        </p>
                    )}
                    <Button variant="outline" onClick={handleStop} className="w-full">
                        Cancelar
                    </Button>
                </div>
            </div>

            <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
        </div>
    );
}
