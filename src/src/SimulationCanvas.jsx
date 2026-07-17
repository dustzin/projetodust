import React, { useRef, useEffect, useState } from 'react';
import { parseThesisManifesto } from './ThesisParser';
import { calculateWave1D, validateTheory } from './physics_engine';

const SimulationCanvas = ({ onUpdateData }) => {
  const canvasRef = useRef(null);
  const [simParams, setSimParams] = useState(null);
  const [thesisConstants, setThesisConstants] = useState(null);
  
  // Audit Trail State (keeps last 5 divergences)
  const [auditTrail, setAuditTrail] = useState([]);
  
  const requestRef = useRef();
  
  // Load configuration and thesis data
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('data/VibPhys_Hub/sim_params.json');
        const params = await response.json();
        setSimParams(params);
        
        const constants = await parseThesisManifesto();
        setThesisConstants(constants);
      } catch (err) {
        console.error("Error loading simulation data:", err);
      }
    };
    loadData();
    
    // Auto-refresh mechanism for thesis updates
    const interval = setInterval(loadData, 5000); // Polling every 5s for updates
    return () => clearInterval(interval);
  }, []);

  // Update Audit Trail when constants/params change
  useEffect(() => {
    if (simParams && thesisConstants) {
      const theoryFreq = thesisConstants.frequency || 432;
      const threshold = thesisConstants.threshold || 0.05;
      const simFreq = simParams.frequency || 432;
      
      const { isValid, divergence } = validateTheory(simFreq, theoryFreq, threshold);
      
      setAuditTrail(prev => {
        const newEntry = {
          time: new Date().toLocaleTimeString(),
          divergence: (divergence * 100).toFixed(2) + '%',
          isValid
        };
        const newTrail = [newEntry, ...prev];
        return newTrail.slice(0, 5); // keep last 5
      });
    }
  }, [simParams, thesisConstants]);

  // Drawing loop
  useEffect(() => {
    if (!simParams || !thesisConstants) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Draw background grid
      ctx.strokeStyle = '#222230';
      ctx.lineWidth = 1;
      for(let i=0; i<width; i+=20) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
      }
      for(let j=0; j<height; j+=20) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(width, j); ctx.stroke();
      }

      ctx.beginPath();
      ctx.moveTo(0, centerY);

      const simFreq = simParams.frequency || 432;
      const theoryFreq = thesisConstants.frequency || 432;
      const k = thesisConstants.elasticity || 0.85;
      const d = thesisConstants.damping || 0.1;
      const baseAmplitude = simParams.amplitude * 50; 
      const phase = simParams.phase || 0;

      for (let x = 0; x < width; x++) {
        const dx = x / 50;
        
        // Use physics_engine strict calculation
        const yOffset = calculateWave1D({
          amplitude: baseAmplitude,
          frequency: simFreq,
          phase: phase,
          elasticity: k,
          damping: d,
          x: dx,
          time: time
        });
        
        // Because damping in function is absolute and we need visual scaling across width:
        // We override visual damping to fit the canvas width.
        const visualDampingEffect = Math.exp(-d * (x / width));
        
        const y = centerY + yOffset * visualDampingEffect;
        ctx.lineTo(x, y);
      }

      // Render wide low-opacity glow line underneath for fast hardware-accelerated look
      ctx.strokeStyle = 'rgba(0, 255, 204, 0.2)';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Render crisp main line
      ctx.strokeStyle = '#00ffcc'; // Technical cyan
      ctx.lineWidth = 2;
      ctx.stroke();

      // Update parent component with real-time data
      // (Removed from 60fps render loop to prevent excessive React re-renders)

      time += 0.05;
      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [simParams, thesisConstants]);

  // Update parent component only when metrics actually change (not 60 times/sec)
  useEffect(() => {
    if (!simParams || !thesisConstants) return;
    const simFreq = simParams.frequency || 432;
    const theoryFreq = thesisConstants.frequency || 432;
    const baseAmplitude = simParams.amplitude * 50; 
    const phase = simParams.phase || 0;
    const threshold = thesisConstants.threshold || 0.05;
    const { isValid } = validateTheory(simFreq, theoryFreq, threshold);

    if (onUpdateData) {
      onUpdateData({
        frequency: simFreq,
        amplitude: (baseAmplitude * 0.1).toFixed(2),
        phase: phase.toFixed(2),
        status: isValid ? 'CONFIRMADO (Ressonância)' : 'THEORY_MISMATCH',
        auditTrail: auditTrail
      });
    }
  }, [simParams, thesisConstants, auditTrail, onUpdateData]);

  return (
    <div className="relative w-full h-full border border-[#1a1a22] rounded overflow-hidden shadow-[0_0_15px_rgba(0,255,204,0.1)]">
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="w-full h-full bg-[#0d0d12]"
      />
      <div className="absolute top-2 left-2 text-[10px] font-mono text-[#00ffcc] opacity-70">
        OSC-01 DIGITAL OSCILLOSCOPE (1D WAVE)
      </div>
    </div>
  );
};

export default SimulationCanvas;
