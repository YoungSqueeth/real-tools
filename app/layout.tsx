import Link from "next/link"
import "./globals.css"

export const metadata = {
  title: "Real Tools",
  description: "Data-driven sports intelligence",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={styles.body}>
        <nav style={styles.nav}>
	  <div style={styles.navWrapper}>
    
	    {/* LEFT: Logo */}
	    <div style={styles.logo}>
 	     Real Tools
 	   </div>

	    {/* CENTER: Tabs */}
	    <div style={styles.centerLinks}>
	      <Link href="/" style={styles.link}>Home</Link>
	      <Link href="/projection-targets" style={styles.link}>	Predictions</Link>
	      <Link href="/stats" style={styles.link}>	Lineup</Link>
	      <Link href="/on-this-day" style={styles.link}>OTD</Link>

	    </div>

	    {/* RIGHT: Empty placeholder */}
	    <div style={styles.rightSpacer}></div>

	  </div>
	</nav>


        <div style={styles.content}>
          {children}
        </div>
      </body>
    </html>
  )
}

const styles = {
  body: {
    margin: 0,
    background: "#525252",
    color: "white",
    fontFamily: "Inter, sans-serif",
  },
  nav: {
    borderBottom: "1px solid #334155",
    backgroundColor: "#262626",
    padding: "15px 0",
    position: "sticky" as const,
    top: 0,
    zIndex: 1000,
  },
  rightSpacer: {
    width: "120px"
  },
  navWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "0 30px",
  },
  logo: {
    fontWeight: 700,
    fontSize: "18px",
  },
  centerLinks: {
    display: "flex",
    gap: "30px",
    justifyContent: "absolute" as const,
    left: "50%",
    transform: "translateX9-50%)",
  },
  link: {
    textDecoration: "none",
    color: "#E5E4BA",
    fontWeight: 500,
  },
  content: {
    paddingTop: "20px",
  },
}
