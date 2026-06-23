function Home() {
  return (
    <>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#312E81'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '50%',
          gap: '16px',
          padding: '16px',
          color: 'white',
          textAlign: 'center'
        }}>
          <h2>Seja bem vinde!</h2>
          <p>Expresse aqui seus pensamentos e opiniões</p>
          <div style={{
            display: 'flex',
            gap: '16px',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}>
            <button style={{
              backgroundColor: 'white',
              color: '#312e81',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 32px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>Nova Postagem</button>
            <button style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: '2px solid white',
              borderRadius: '4px',
              padding: '8px 32px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>Ver Postagens</button>
          </div>
        </div>
        <div style={{
          display: 'flex',
          width: '50%',
          justifyContent: 'center'
        }}>
          <img
            src="https://i.imgur.com/fyfri1v.png"
            alt="Imagem da página home"
            style={{ width: '400px' }}
          />
        </div>
      </div>
    </>
  )
}

export default Home
