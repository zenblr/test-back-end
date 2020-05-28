import { Injectable } from "@angular/core";

const PDF_TYPE = "application/pdf";
const PDF_EXTENSION = ".pdf";

@Injectable()
export class PdfService {
	constructor() {}

	public saveAsPdfFile(buffer: any, fileName: string): void {
		var file = new Blob([buffer], { type: PDF_TYPE });
		var fileURL = URL.createObjectURL(file);
		var a = document.createElement("a");
		a.href = fileURL;
		a.target = "_blank";
		a.download = fileName + PDF_EXTENSION;
		document.body.appendChild(a);
		a.click();
	}
}
