import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, Camera } from "lucide-react";
import { Button } from "./ui/button";

interface BarcodeScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onClose: () => void;
}

export function BarcodeScanner({ onScanSuccess, onClose }: BarcodeScannerProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const regionId = "barcode-scanner-region";

    useEffect(() => {
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
                    // Failure callback is too noisy, ignoring
                }
            )
            .catch((err) => {
                console.error("Error starting scanner:", err);
            });

        return () => {
            if (scanner.isScanning) {
                scanner.stop().catch(e => console.error("Error stopping on unmount", e));
            }
        };
    }, [onScanSuccess]);

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
                            <p className="text-xs text-gray-500 font-normal">Posicione o produto em frente à câmera</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleStop} className="rounded-full hover:bg-gray-100">
                        <X className="size-5 text-gray-500" />
                    </Button>
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

                    {/* Hints */}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                            <p className="text-xs text-white font-medium">Buscando código...</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 text-center bg-white border-t">
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
