declare module 'pdfkit' {
  import { EventEmitter } from 'events';

  interface PDFDocumentOptions {
    size?: string | [number, number];
    margin?: number | {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    bufferPages?: boolean;
    autoFirstPage?: boolean;
    compress?: boolean;
    info?: {
      Title?: string;
      Author?: string;
      Subject?: string;
      Keywords?: string;
      CreationDate?: Date;
      ModDate?: Date;
    };
    userPassword?: string;
    ownerPassword?: string;
    permissions?: {
      printing?: string;
      modifying?: boolean;
      copying?: boolean;
      annotating?: boolean;
      fillingForms?: boolean;
      contentAccessibility?: boolean;
      documentAssembly?: boolean;
    };
    pdfVersion?: string;
  }

  interface TextOptions {
    width?: number;
    height?: number;
    align?: 'left' | 'center' | 'right' | 'justify';
    indent?: number;
    paragraphGap?: number;
    lineGap?: number;
    columns?: number;
    columnGap?: number;
    continued?: boolean;
    oblique?: boolean | number;
    underline?: boolean;
    strike?: boolean;
    fill?: boolean;
    link?: string;
    anchor?: string;
    goTo?: string;
    destination?: string;
    bold?: boolean;
    features?: string[];
  }

  class PDFDocument extends EventEmitter {
    constructor(options?: PDFDocumentOptions);
    
    addPage(options?: PDFDocumentOptions): this;
    font(font: string): this;
    fontSize(size: number): this;
    text(text: string, x?: number, y?: number, options?: TextOptions): this;
    fillColor(color: string, opacity?: number): this;
    strokeColor(color: string, opacity?: number): this;
    moveDown(lines?: number): this;
    moveUp(lines?: number): this;
    lineCap(style: string): this;
    lineWidth(width: number): this;
    moveTo(x: number, y: number): this;
    lineTo(x: number, y: number): this;
    stroke(): this;
    rect(x: number, y: number, width: number, height: number): this;
    roundedRect(x: number, y: number, width: number, height: number, radius: number): this;
    fillAndStroke(fillColor?: string, strokeColor?: string): this;
    end(): void;
  }

  export default PDFDocument;
}