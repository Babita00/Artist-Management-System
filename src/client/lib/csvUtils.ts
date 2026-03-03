import { handleAPIError } from './handleError'

/**
 * Downloads a Blob/ArrayBuffer response as a CSV file in the browser.
 *
 * @param fetchFn  - An async function that returns the raw response data (Blob | ArrayBuffer | string)
 * @param filename - The name to give the downloaded file (e.g. 'artists_export.csv')
 */
export const downloadCsv = async (
  fetchFn: () => Promise<BlobPart>,
  filename: string,
): Promise<void> => {
  try {
    const response = await fetchFn()
    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    handleAPIError(err)
  }
}

/**
 * Builds a FormData payload from a File and calls the provided import API function.
 * Returns true on success, false on failure.
 *
 * @param file      - The CSV File object selected by the user
 * @param importFn  - An async function that accepts FormData and calls the import API
 * @param fieldName - The form-data field name expected by the server (default: 'file')
 */
export const submitCsvImport = async (
  file: File,
  importFn: (formData: FormData) => Promise<unknown>,
  fieldName = 'file',
): Promise<boolean> => {
  try {
    const formData = new FormData()
    formData.append(fieldName, file)
    await importFn(formData)
    return true
  } catch (err) {
    handleAPIError(err)
    return false
  }
}
