'use client';

import { Toaster } from 'react-hot-toast';
import LabelGeneratorSimple from '../components/LabelGeneratorSimple';

export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <Toaster position="top-right" />
      
      <div style={{ 
        maxWidth: '1600px', 
        margin: '0 auto',
        backgroundColor: 'white',
        minHeight: 'calc(100vh - 40px)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          borderBottom: '2px solid #003366',
          padding: '20px 30px',
          backgroundColor: 'white'
        }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '600',
            color: '#003366',
            margin: 0
          }}>
            EFO Label Generator
          </h1>
          <p style={{ 
            fontSize: '14px',
            color: '#666',
            margin: '5px 0 0 0'
          }}>
            Sistema de generación e impresión masiva de etiquetas industriales
          </p>
        </div>
        
        <LabelGeneratorSimple />
      </div>
    </div>
  );
}
