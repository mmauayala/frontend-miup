import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material"

const SaleInfoDialog = ({ open, onClose, saleInfo }) => {
  if (!saleInfo) return null

  // Calculate the total amount from the sale info
  const totalAmount = saleInfo.reduce((total, item) => total + (item.precioVenta || 0) * (item.cantidadVendida || 0), 0)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Informacion de Compra</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell align="right">Precio</TableCell>
                <TableCell align="right">Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {saleInfo.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.producto}</TableCell>
                  <TableCell align="right">{item.cantidadVendida}</TableCell>
                  <TableCell align="right">${(item.precioVenta || 0).toFixed(2)}</TableCell>
                  <TableCell align="right">
                    ${((item.precioVenta || 0) * (item.cantidadVendida || 0)).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography variant="h6" align="right" style={{ marginTop: "1rem" }}>
          Total: ${totalAmount.toFixed(2)}
        </Typography>
        {saleInfo[0]?.transaccionId && (
          <Typography variant="body2" style={{ marginTop: "1rem" }}>
            ID Transaccion: {saleInfo[0].transaccionId}
          </Typography>
        )}
        {saleInfo[0]?.fechaVenta && (
          <Typography variant="body2">Fecha: {new Date(saleInfo[0].fechaVenta).toLocaleString()}</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SaleInfoDialog

