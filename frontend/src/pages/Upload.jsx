import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import DocumentUpload from '../components/features/DocumentUpload'

const Upload = () => {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 min-h-screen bg-gradient-to-b from-saffron-50 via-white to-trust-50">
        <DocumentUpload />
      </main>
      <Footer />
    </>
  )
}

export default Upload
