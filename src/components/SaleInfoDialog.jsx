"use client"

import styles from "../styles/SaleInfoDialog.module.css"

const SaleInfoDialog = ({ open, onClose, saleInfo }) => {
  if (!open || !saleInfo) return null

  // Calculate total by summing the precioVenta values directly from the API response
  const totalAmount = saleInfo.reduce((total, item) => {
    return total + item.precioVenta
  }, 0)

  return (
    <>
      <div className={styles.dialogOverlay} onClick={onClose} />
      <div className={styles.dialog}>
        <h2 className={styles.dialogTitle}>Informacion de venta</h2>
        <div className={styles.dialogContent}>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.tableHeaderCell}>ID Venta</th>
                  <th className={styles.tableHeaderCell}>Cantidad</th>
                  <th className={styles.tableHeaderCell}>Precio</th>
                </tr>
              </thead>
              <tbody>
                {saleInfo.map((item) => (
                  <tr key={item.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>{item.id}</td>
                    <td className={styles.tableCell}>{item.cantidadVendida}</td>
                    <td className={styles.tableCell}>${item.precioVenta.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.totalAmount}>Total: ${totalAmount.toFixed(2)}</div>
          {saleInfo[0]?.transaccionId && (
            <div className={styles.transactionInfo}>
              <p>Transaction ID: {saleInfo[0].transaccionId}</p>
              {saleInfo[0]?.fechaVenta && <p>Fecha: {new Date(saleInfo[0].fechaVenta).toLocaleString()}</p>}
            </div>
          )}
        </div>
        <div className={styles.dialogActions}>
          <button onClick={onClose} className={styles.closeButton}>
            Cerrar
          </button>
        </div>
      </div>
    </>
  )
}

export default SaleInfoDialog

