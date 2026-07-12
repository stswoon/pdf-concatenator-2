function SeoIntro() {
  return (
    <section className="space-y-6 text-sm leading-relaxed text-muted-foreground">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Merge, split, and compress PDFs in your browser
        </h2>
        <p>
          PDF Concatenator is a free, privacy-first tool for working with PDF files and images.
          Your files are never sent to a server — all processing happens only in your browser, on
          your device. Documents stay local from import to export.
        </p>
      </div>

      <div className="rounded-lg border bg-muted/40 px-4 py-3">
        <p className="text-foreground">
          <strong className="font-medium">100% client-side.</strong> Nothing leaves your computer.
          No uploads, no cloud storage, no third-party servers — merge, split, and compress PDFs
          entirely in your browser.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium text-foreground">What you can do</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-medium text-foreground">Merge PDFs and images</strong> — combine
            multiple PDFs, JPG, and PNG files into a single document while keeping original PDF text
            selectable.
          </li>
          <li>
            <strong className="font-medium text-foreground">Split to images</strong> — export pages
            as separate PNG or JPG files, bundled in a ZIP when needed.
          </li>
          <li>
            <strong className="font-medium text-foreground">Reorder pages</strong> — drag and drop
            thumbnails to arrange pages before exporting.
          </li>
          <li>
            <strong className="font-medium text-foreground">Compress images</strong> — reduce file
            size with quality and dimension controls before export.
          </li>
        </ul>
      </div>

      <p>
        Drop PDF, JPG, or PNG files into the area above to get started. No account, no install, no
        waiting — just open the page and work with your documents.
      </p>
    </section>
  )
}

export default SeoIntro
