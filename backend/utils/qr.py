import qrcode
import io
import base64

def generate_qr_base64(data: str) -> str:
    """Generates a reliable PNG QR Code and returns data URI string."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=2,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#141923", back_color="#F9F8F5")
    
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"

def generate_qr_bytes(data: str) -> bytes:
    """Generates PNG bytes for direct image HTTP response."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=2,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#141923", back_color="#F9F8F5")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return buffer.getvalue()
