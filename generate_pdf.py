# -*- coding: utf-8 -*-
import os
import sys
from PIL import Image as PILImage
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Multi-pass canvas for Page X of Y page numbers, premium headers and footer rules.
    """
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        if self._pageNumber == 1:
            return  # Skip cover page
            
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#4b5563")) # Gray-600

        # Header bar
        self.drawString(54, 755, "MrMobi Store — Comprehensive Technical Architecture Documentation")
        self.setStrokeColor(colors.HexColor("#e5e7eb"))
        self.setLineWidth(0.5)
        self.line(54, 747, 558, 747)

        # Footer bar
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, page_str)
        self.drawString(54, 36, "Confidential — Platform System Architecture & Reference Guide")
        self.line(54, 48, 558, 48)

        self.restoreState()

def create_styled_h1(text, style):
    """
    Creates a styled H1 section header using a single-cell ReportLab table 
    with a thick violet left accent border.
    """
    p = Paragraph(text, style)
    t = Table([[p]], colWidths=[504])
    t.setStyle(TableStyle([
        ('LINELEFT', (0,0), (0,0), 3.5, colors.HexColor("#4f46e5")), # Violet
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")), # Light gray
        ('PADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,-1), 10),
    ]))
    return t

def create_code_block(code_text, style):
    """
    Creates a clean, padded gray code block table.
    """
    p = Paragraph(code_text.replace("\n", "<br/>").replace(" ", "&nbsp;"), style)
    t = Table([[p]], colWidths=[504])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
        ('PADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
    ]))
    return t

def get_scaled_image(path, max_width=480, max_height=260):
    """
    Loads and scales a screenshot preserving aspect ratio.
    """
    if not os.path.exists(path):
        return None
    try:
        img = PILImage.open(path)
        w, h = img.size
        aspect = h / float(w)
        scaled_w = max_width
        scaled_h = int(scaled_w * aspect)
        if scaled_h > max_height:
            scaled_h = max_height
            scaled_w = int(scaled_h / aspect)
        
        flowable_img = Image(path, width=scaled_w, height=scaled_h)
        t = Table([[flowable_img]], colWidths=[scaled_w + 10])
        t.setStyle(TableStyle([
            ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor("#e2e8f0")),
            ('PADDING', (0,0), (-1,-1), 5),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ]))
        return t
    except Exception as e:
        print(f"Error loading image {path}: {e}")
        return None

def build_pdf():
    pdf_filename = "MrMobi_Platform_Documentation.pdf"
    
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    primary_color = colors.HexColor("#4f46e5") # Indigo-600
    secondary_color = colors.HexColor("#0f766e") # Teal-700
    text_color = colors.HexColor("#1e293b") # Slate-800
    code_color = colors.HexColor("#0f172a") # Slate-900

    style_cover_title = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=30,
        leading=36,
        textColor=primary_color,
        spaceAfter=10
    )

    style_cover_subtitle = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#475569"),
        spaceAfter=15
    )

    style_cover_link_card = ParagraphStyle(
        'CoverLinkCard',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#4f46e5"),
        alignment=1 # Centered
    )

    style_h1 = ParagraphStyle(
        'CustomH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=primary_color,
    )

    style_h2 = ParagraphStyle(
        'CustomH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=secondary_color,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    style_body = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=text_color,
        spaceBefore=4,
        spaceAfter=6
    )

    style_table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    style_table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=text_color
    )

    style_table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=text_color
    )

    style_code = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10,
        textColor=code_color
    )

    story = []

    # ==========================================
    # COVER PAGE
    # ==========================================
    story.append(Spacer(1, 80))
    story.append(Paragraph("MrMobi Store", style_cover_title))
    story.append(Paragraph("Enterprise Full-Stack E-Commerce System Architecture Manual", style_cover_subtitle))
    
    # Elegant link block
    link_block_data = [[
        Paragraph("🌐 Live Web Application URL:<br/><b>https://mrmobi-store-ecommerce-full-stack.vercel.app</b>", style_cover_link_card)
    ]]
    link_table = Table(link_block_data, colWidths=[504])
    link_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#e0e7ff")),
        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor("#818cf8")),
        ('PADDING', (0,0), (-1,-1), 10),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ]))
    story.append(link_table)
    story.append(Spacer(1, 20))

    # Divider bar
    d_table = Table([[""]], colWidths=[504])
    d_table.setStyle(TableStyle([
        ('LINEBELOW', (0,0), (-1,-1), 3.5, primary_color),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(d_table)
    story.append(Spacer(1, 20))

    meta_text = """
    <b>Document Type:</b> Full-Stack Codebase & Operations Blueprint Manual<br/>
    <b>Target Deployments:</b> Vercel Edge Server (Vite) / Render PaaS Container (Spring Boot + MySQL)<br/>
    <b>Author:</b> Satish Veesam — Full-Stack Engineer<br/>
    <b>Git Remote Repo:</b> github.com/satishveesam/mrmobi-store_ecommerce_full-stack<br/>
    <b>Compilation Scope:</b> 12 Front Storefront Views, 11 Administrative Portals, 5 Central Redux Slices, and Spring Boot Persistence & REST Controller Interfaces.<br/>
    """
    story.append(Paragraph(meta_text, style_body))
    story.append(Spacer(1, 80))
    story.append(Paragraph("<i>Confidential Technical Manual. Compiled directly via static scan of the active repository.</i>", style_body))
    story.append(PageBreak())

    # ==========================================
    # SECTION 1: SYSTEM CAPABILITIES & SCOPE
    # ==========================================
    story.append(create_styled_h1("1. Executive Summary & Production Environment", style_h1))
    story.append(Spacer(1, 10))
    
    intro_txt = """
    The <b>MrMobi Store</b> is an enterprise e-commerce platform built on high-performance architectures. The complete platform features a responsive single-page web client deployed in production at <b>https://mrmobi-store-ecommerce-full-stack.vercel.app</b>, backed by a scalable Spring Boot REST service containerized on the Render platform. This technical manual represents a comprehensive reference guide of the verified code, models, slices, and REST paths present across the codebase.
    """
    story.append(Paragraph(intro_txt, style_body))
    
    story.append(Paragraph("Platform Operational Design Scopes:", style_h2))
    scopes_txt = """
    • <b>Production Storefront:</b> A rich-designed UI built for lightning-fast client transitions, utilizing responsive Tailwind configurations, HSL color tokens, and layout preloading.<br/>
    • <b>Back-office Dashboard:</b> Administrative control panel featuring analytics charts, transactional moderation pipelines, and live auditory chimes for orders.<br/>
    • <b>WhatsApp Secure Checkout:</b> Sandboxed visibility integrations preventing duplicate order issues during context-switching redirections.<br/>
    • <b>Pincode Express Delivery:</b> Automatic 2-hour delivery notice banner triggered on localized pincode matching.
    """
    story.append(Paragraph(scopes_txt, style_body))

    story.append(Spacer(1, 10))
    h_img = get_scaled_image("screenshots/home.png")
    if h_img:
        story.append(Paragraph("<b>Figure 1.1:</b> Active Production Storefront Homepage Layout", style_table_cell_bold))
        story.append(Spacer(1, 4))
        story.append(h_img)
    
    story.append(PageBreak())

    # ==========================================
    # SECTION 2: FRONTEND STOREFRONT VIEWS (12 Pages)
    # ==========================================
    story.append(create_styled_h1("2. Frontend Storefront Architecture (12 Views)", style_h1))
    story.append(Spacer(1, 10))

    story.append(Paragraph("The storefront contains exactly 12 dedicated page-level components inside <code>client/src/pages/user</code>:", style_body))

    user_pages_data = [
        [Paragraph("<b>Component Name</b>", style_table_header), Paragraph("<b>Size (Bytes)</b>", style_table_header), Paragraph("<b>Functionality & State Operations</b>", style_table_header)],
        [Paragraph("Home.jsx", style_table_cell_bold), Paragraph("6,764 B", style_table_cell), Paragraph("Renders promotional sliders, category filters, and product queries. Mounts layout components.", style_table_cell)],
        [Paragraph("ProductListing.jsx", style_table_cell_bold), Paragraph("8,120 B", style_table_cell), Paragraph("Catalog list view with client-side sort selectors (price ascending/descending) and category filters.", style_table_cell)],
        [Paragraph("ProductDetailsPage.jsx", style_table_cell_bold), Paragraph("9,421 B", style_table_cell), Paragraph("Displays item attributes, reviews, and isolated single-item Buy Now bypass triggers.", style_table_cell)],
        [Paragraph("Cart.jsx", style_table_cell_bold), Paragraph("19,693 B", style_table_cell), Paragraph("Unified shopping cart UI displaying totals and sync states.", style_table_cell)],
        [Paragraph("Checkout.jsx", style_table_cell_bold), Paragraph("33,165 B", style_table_cell), Paragraph("Addresses management, WhatsApp message compiler, and redirection tracking hooks.", style_table_cell)],
        [Paragraph("MyOrders.jsx", style_table_cell_bold), Paragraph("20,181 B", style_table_cell), Paragraph("Lists active customer transactions. Features whitelisted 2-hour alert banners and 30-min cancellations.", style_table_cell)],
        [Paragraph("Addresses.jsx", style_table_cell_bold), Paragraph("15,210 B", style_table_cell), Paragraph("Address builder supporting village, city, state, and pincode configuration.", style_table_cell)],
        [Paragraph("Login.jsx", style_table_cell_bold), Paragraph("26,762 B", style_table_cell), Paragraph("Authenticates customers and pre-authorizes notification permissions.", style_table_cell)],
        [Paragraph("Signup.jsx", style_table_cell_bold), Paragraph("23,817 B", style_table_cell), Paragraph("New user registration with strict validation rules.", style_table_cell)],
        [Paragraph("Profile.jsx", style_table_cell_bold), Paragraph("8,202 B", style_table_cell), Paragraph("Edits personal profile details and security passwords.", style_table_cell)],
        [Paragraph("Wishlist.jsx", style_table_cell_bold), Paragraph("2,131 B", style_table_cell), Paragraph("Displays product favorites retrieved from state.", style_table_cell)],
        [Paragraph("NotFound.jsx", style_table_cell_bold), Paragraph("288 B", style_table_cell), Paragraph("404 fallback page.", style_table_cell)]
    ]
    u_p_table = Table(user_pages_data, colWidths=[120, 70, 314])
    u_p_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(u_p_table)

    story.append(Spacer(1, 10))
    p_img = get_scaled_image("screenshots/products.png")
    if p_img:
        story.append(Paragraph("<b>Figure 2.1:</b> Catalog Navigation and Search Listing View on Vercel Live", style_table_cell_bold))
        story.append(Spacer(1, 4))
        story.append(p_img)

    story.append(PageBreak())

    # ==========================================
    # SECTION 3: FRONTEND ADMIN VIEWS (11 Pages)
    # ==========================================
    story.append(create_styled_h1("3. Frontend Administrative Command Center (11 Views)", style_h1))
    story.append(Spacer(1, 10))

    story.append(Paragraph("The back-office administration portal contains exactly 11 page-level views in <code>client/src/pages/admin</code>:", style_body))

    admin_pages_data = [
        [Paragraph("<b>Component Name</b>", style_table_header), Paragraph("<b>Size (Bytes)</b>", style_table_header), Paragraph("<b>Administrative Capabilities & Features</b>", style_table_header)],
        [Paragraph("AdminDashboard.jsx", style_table_cell_bold), Paragraph("14,209 B", style_table_cell), Paragraph("Central command with daily sales trends, charts, and metrics cards.", style_table_cell)],
        [Paragraph("AdminLogin.jsx", style_table_cell_bold), Paragraph("2,470 B", style_table_cell), Paragraph("Admin login with audio gesture unlock filters.", style_table_cell)],
        [Paragraph("Orders.jsx", style_table_cell_bold), Paragraph("5,598 B", style_table_cell), Paragraph("Displays transaction lists. Features latest-orders-on-top sorting.", style_table_cell)],
        [Paragraph("ProductManagement.jsx", style_table_cell_bold), Paragraph("9,118 B", style_table_cell), Paragraph("CRUD interface for product stocks, prices, details.", style_table_cell)],
        [Paragraph("CategoryManagement.jsx", style_table_cell_bold), Paragraph("13,202 B", style_table_cell), Paragraph("Maintains sequence mappings and Lucide categories icon tags.", style_table_cell)],
        [Paragraph("BannerManagement.jsx", style_table_cell_bold), Paragraph("14,561 B", style_table_cell), Paragraph("Schedules promotional banners.", style_table_cell)],
        [Paragraph("ShippingManagement.jsx", style_table_cell_bold), Paragraph("24,721 B", style_table_cell), Paragraph("Whitelists express delivery pincodes and standard rules.", style_table_cell)],
        [Paragraph("HomepageSettings.jsx", style_table_cell_bold), Paragraph("21,122 B", style_table_cell), Paragraph("Updates announcement text, collections banners, and explorer links.", style_table_cell)],
        [Paragraph("AdminUsers.jsx", style_table_cell_bold), Paragraph("17,081 B", style_table_cell), Paragraph("Manages customer roles, security states.", style_table_cell)],
        [Paragraph("AdminReviews.jsx", style_table_cell_bold), Paragraph("8,037 B", style_table_cell), Paragraph("Moderates customer ratings.", style_table_cell)],
        [Paragraph("AdminOutOfStock.jsx", style_table_cell_bold), Paragraph("16,847 B", style_table_cell), Paragraph("Monitors out-of-stock and low-stock items.", style_table_cell)]
    ]
    a_p_table = Table(admin_pages_data, colWidths=[130, 70, 304])
    a_p_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(a_p_table)

    story.append(Spacer(1, 10))
    a_img = get_scaled_image("screenshots/admin.png")
    if a_img:
        story.append(Paragraph("<b>Figure 3.1:</b> Analytics Dashboards and Live Transaction Feeds", style_table_cell_bold))
        story.append(Spacer(1, 4))
        story.append(a_img)

    story.append(PageBreak())

    # ==========================================
    # SECTION 4: REDUX STATE MANAGEMENT
    # ==========================================
    story.append(create_styled_h1("4. Client State Architecture & Redux Store", style_h1))
    story.append(Spacer(1, 10))

    redux_txt = """
    Central state management is handled by <b>Redux Toolkit</b>. The centralized store compiles exactly 5 specialized slices to enforce clean, predictable mutations across storefront actions.
    """
    story.append(Paragraph(redux_txt, style_body))

    redux_slices_data = [
        [Paragraph("<b>Redux Slice</b>", style_table_header), Paragraph("<b>Key State Tokens</b>", style_table_header), Paragraph("<b>Synchronized Actions & Triggers</b>", style_table_header)],
        [Paragraph("authSlice.js", style_table_cell_bold), Paragraph("<code>user</code>, <code>token</code>, <code>isAuthenticated</code>, <code>loading</code>", style_table_cell), Paragraph("<code>loginUser</code>, <code>registerUser</code>, <code>logout</code>, <code>updateProfile</code>", style_table_cell)],
        [Paragraph("cartSlice.js", style_table_cell_bold), Paragraph("<code>items</code>, <code>totalAmount</code>, <code>syncing</code>", style_table_cell), Paragraph("<code>addToCart</code>, <code>removeFromCart</code>, <code>syncCartWithBackend</code>", style_table_cell)],
        [Paragraph("wishlistSlice.js", style_table_cell_bold), Paragraph("<code>items</code>, <code>loading</code>", style_table_cell), Paragraph("<code>toggleWishlist</code>, <code>fetchWishlist</code>", style_table_cell)],
        [Paragraph("productSlice.js", style_table_cell_bold), Paragraph("<code>items</code>, <code>activeProduct</code>, <code>categories</code>", style_table_cell), Paragraph("<code>fetchCatalog</code>, <code>fetchProductById</code>", style_table_cell)],
        [Paragraph("orderSlice.js", style_table_cell_bold), Paragraph("<code>items</code>, <code>recentOrder</code>, <code>error</code>", style_table_cell), Paragraph("<code>placeOrder</code>, <code>fetchOrders</code>, <code>cancelOrder</code>", style_table_cell)]
    ]
    r_table = Table(redux_slices_data, colWidths=[100, 140, 264])
    r_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(r_table)

    story.append(Paragraph("Axios REST Service Broker Pattern", style_h2))
    service_txt = """
    HTTP queries are routed through a standardized API client service located at <code>client/src/services/api.js</code>. Rather than scattered endpoints, the Axios instance handles JWT headers dynamically:
    """
    story.append(Paragraph(service_txt, style_body))

    axios_code = """import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mrmobi_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;"""
    story.append(create_code_block(axios_code, style_code))

    story.append(PageBreak())

    # ==========================================
    # SECTION 5: BACKEND REST ARCHITECTURE
    # ==========================================
    story.append(create_styled_h1("5. Backend REST API Architecture & DB Schema", style_h1))
    story.append(Spacer(1, 10))

    backend_txt = """
    The backend architecture utilizes **Spring Boot** with **Java 21**, implementing a strict **Controller-Service-Repository Pattern**. The persistence layer leverages Spring Data JPA and Hibernate for mapping relational schemas directly to a MySQL database.
    """
    story.append(Paragraph(backend_txt, style_body))

    story.append(Paragraph("Primary Spring Controller Endpoints:", style_h2))

    # Detailed endpoints data
    endpoints_data = [
        [Paragraph("<b>Scope</b>", style_table_header), Paragraph("<b>Endpoint Path</b>", style_table_header), Paragraph("<b>Access Level</b>", style_table_header), Paragraph("<b>Business Process Operations</b>", style_table_header)],
        [Paragraph("Authentication", style_table_cell_bold), Paragraph("POST <code>/api/auth/register</code><br/>POST <code>/api/auth/login</code>", style_table_cell), Paragraph("PermitAll", style_table_cell), Paragraph("User onboarding and JWT credentials issuance.", style_table_cell)],
        [Paragraph("Products Store", style_table_cell_bold), Paragraph("GET <code>/api/products</code><br/>GET <code>/api/products/{id}</code>", style_table_cell), Paragraph("PermitAll", style_table_cell), Paragraph("Catalog listings, dynamic filtering and details.", style_table_cell)],
        [Paragraph("Products Admin", style_table_cell_bold), Paragraph("POST <code>/api/products</code><br/>PUT <code>/api/products/{id}</code>", style_table_cell), Paragraph("ROLE_ADMIN", style_table_cell_bold), Paragraph("CRUD inventory levels, prices and quick delivery flags.", style_table_cell)],
        [Paragraph("Cart Sync", style_table_cell_bold), Paragraph("POST <code>/api/cart/sync</code><br/>DELETE <code>/api/cart/{id}</code>", style_table_cell), Paragraph("ROLE_USER", style_table_cell), Paragraph("Synchronizes user shopping carts across logins.", style_table_cell)],
        [Paragraph("Checkout & Orders", style_table_cell_bold), Paragraph("POST <code>/api/orders</code><br/>POST <code>/api/orders/bulk</code>", style_table_cell), Paragraph("PermitAll", style_table_cell), Paragraph("Generates orders, updates database inventories.", style_table_cell)],
        [Paragraph("Orders Admin", style_table_cell_bold), Paragraph("GET <code>/api/orders</code><br/>PUT <code>/api/orders/{id}/status</code>", style_table_cell), Paragraph("ROLE_ADMIN", style_table_cell_bold), Paragraph("Modifies statuses with async email chimes. Sorted descending.", style_table_cell)]
    ]

    end_table = Table(endpoints_data, colWidths=[74, 180, 80, 170])
    end_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(end_table)

    story.append(Spacer(1, 10))
    c_img = get_scaled_image("screenshots/checkout.png")
    if c_img:
        story.append(Paragraph("<b>Figure 5.1:</b> Checkout addresses validation on Vercel Client storefront", style_table_cell_bold))
        story.append(Spacer(1, 4))
        story.append(c_img)

    story.append(PageBreak())

    # ==========================================
    # SECTION 6: ADVANCED TECHNICAL CASE STUDIES
    # ==========================================
    story.append(create_styled_h1("6. Advanced Engineering Case Studies", style_h1))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Case Study A: Redirection-Resilient Context Switches (bfcache)", style_h2))
    csa_txt = """
    <b>Background:</b> Launching external apps (such as WhatsApp deep-linking for checkout message verification) triggers a browser tab state switch. On return, the client React application was prone to state truncation or duplicate checkout actions.
    <br/><br/>
    <b>Architecture Solution:</b> Implemented bfcache listeners (<code>pageshow</code>, <code>visibilitychange</code>) using <code>sessionStorage</code> in <code>Checkout.jsx</code>. When checkout completes and triggers external redirection, the tab marks <code>mrmobi_page_was_hidden</code>. Upon page refocus, the application interceptor instantly processes order storage arrays and securely routes the user to <code>/my-orders</code>, avoiding any duplicated checkouts.
    """
    story.append(Paragraph(csa_txt, style_body))

    story.append(Paragraph("Case Study B: Timezone-Resilient LocalDateTime Matching", style_h2))
    csb_txt = """
    <b>Background:</b> Spring Boot default LocalDateTime serialization excludes UTC offsets. Parsing raw dates directly on client-side JS created large offset errors (e.g. India Standard Time is UTC+5.30), mistakenly blocking order cancellations.
    <br/><br/>
    <b>Architecture Solution:</b> Standardized time parsing within <code>MyOrders.jsx</code>. The system parses date-time strings by replacing spaces with <code>T</code> delimiters to compile raw epochs. It then integrates a resilient clock-drift safety buffer window of <code>-5</code> minutes, providing absolute client-server synchronization, ensuring orders can only be cancelled within exactly 30 minutes.
    """
    story.append(Paragraph(csb_txt, style_body))

    story.append(Paragraph("Case Study C: Dynamic Pincode Whitelisting & Snappy Status Updates", style_h2))
    csc_txt = """
    <b>Background:</b> Displaying the express 2-hour delivery alert notice must be strictly limited to whitelisted zones. Additionally, administrative status triggers were slow due to synchronous SMTP mail dispatches.
    <br/><br/>
    <b>Architecture Solution:</b> 
    1. <b>Localized Whitelisting:</b> Built an API-driven lookup parser checking 6-digit regex codes (<code>/\b\d{6}\b/</code>) from addresses against coverage tables in both <code>MyOrders.jsx</code> and admin <code>OrderTable.jsx</code>.
    2. <b>Snappy Updates:</b> Configured <code>@Async</code> on public mail triggers in <code>EmailService.java</code>. Since internal calls on the same class bypass Spring's AOP proxy, moving annotations directly to public endpoints keeps the web thread responsive, returning a <code>200 OK</code> to the admin dashboard instantly while emails deliver in the background.
    """
    story.append(Paragraph(csc_txt, style_body))

    story.append(PageBreak())

    # ==========================================
    # SECTION 7: DEPLOYMENT MANUAL
    # ==========================================
    story.append(create_styled_h1("7. Operations & Deployment Blueprint", style_h1))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Spring Boot: Multi-Stage Production Dockerfile", style_h2))
    story.append(Paragraph("The backend is packaged using a multi-stage Docker build to minimize container size in production:", style_body))
    
    docker_code = """# Stage 1: Dependency Caching & Build
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal Runtime Container
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]"""
    
    story.append(create_code_block(docker_code, style_code))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Cloud Infrastructure: Render YAML Orchastration", style_h2))
    
    render_code = """services:
  - type: web
    name: mrmobi-store-backend
    env: docker
    plan: free
    envVars:
      - key: SPRING_DATASOURCE_URL
        value: jdbc:mysql://db.render.com/mrmobi_db?useSSL=true
      - key: SPRING_DATASOURCE_USERNAME
        value: satish_db_user
      - key: SPRING_DATASOURCE_PASSWORD
        value: secure_production_password
      - key: JWT_SECRET
        value: cryptographic_jwt_signing_token_string"""
    
    story.append(create_code_block(render_code, style_code))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Vite Storefront: Production Vercel Configuration", style_h2))
    story.append(Paragraph("The React storefront is deployed on Vercel with clean URL rewrites to support React Router single-page navigation: <code>vercel.json</code>", style_body))
    
    vercel_code = """{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://mrmobi-backend.onrender.com/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}"""
    story.append(create_code_block(vercel_code, style_code))

    story.append(Spacer(1, 20))
    story.append(Paragraph("<b>End of Document.</b> compiled and generated for the MrMobi Store E-Commerce Platform.", style_body))

    doc.build(story, canvasmaker=NumberedCanvas)
    print("PDF Generation complete: MrMobi_Platform_Documentation.pdf")

if __name__ == "__main__":
    build_pdf()
