import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3000';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  const [activeTab, setActiveTab] = useState('estoque');
  const [ingredients, setIngredients] = useState([]);
  const [products, setProducts] = useState([]);
  const [productionHistory, setProductionHistory] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newIngredient, setNewIngredient] = useState({ name: '', quantity: '', unitCost: '' });
  const [newProduction, setNewProduction] = useState({ productName: '', ingredientName: '', ingredientUsed: '', outputQuantity: '' });
  const [newSale, setNewSale] = useState({ productName: '', quantity: '', totalValue: '' });

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      if (res.ok) {
        setIsLoggedIn(true);
      } else {
        alert('Usuário ou senha inválidos');
      }
    } catch (err) {
      alert('Erro ao conectar com o servidor');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ing, prod, hist, sales] = await Promise.all([
        fetch(`${API_URL}/ingredients`).then(res => res.json()),
        fetch(`${API_URL}/products`).then(res => res.json()),
        fetch(`${API_URL}/production`).then(res => res.json()),
        fetch(`${API_URL}/sales`).then(res => res.json()),
      ]);
      setIngredients(Array.isArray(ing) ? ing : []);
      setProducts(Array.isArray(prod) ? prod : []);
      setProductionHistory(Array.isArray(hist) ? hist : []);
      setSalesHistory(Array.isArray(sales) ? sales : []);
    } catch (err) {
      console.error("Erro ao carregar dados", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = async (e: any) => {
    e.preventDefault();
    await fetch(`${API_URL}/ingredients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newIngredient.name,
        quantity: parseFloat(newIngredient.quantity as string),
        unitCost: parseFloat(newIngredient.unitCost as string)
      }),
    });
    setNewIngredient({ name: '', quantity: '', unitCost: '' });
    fetchData();
  };

  const handleProduction = async (e: any, type: string) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/production`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newProduction,
        ingredientUsed: parseFloat(newProduction.ingredientUsed as string),
        outputQuantity: parseFloat(newProduction.outputQuantity as string),
        productionType: type
      }),
    });
    if (res.ok) {
      setNewProduction({ productName: '', ingredientName: '', ingredientUsed: '', outputQuantity: '' });
      fetchData();
    } else {
      const error = await res.json();
      alert(error.message);
    }
  };

  const handleSale = async (e: any) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName: newSale.productName,
        quantity: parseFloat(newSale.quantity as string),
        totalValue: parseFloat(newSale.totalValue as string)
      }),
    });
    if (res.ok) {
      setNewSale({ productName: '', quantity: '', totalValue: '' });
      fetchData();
    } else {
      const error = await res.json();
      alert(error.message);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-orange-600 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
          <h1 className="text-2xl font-bold text-center text-orange-600 mb-6">Sistema de Gestão <br /> Doces Sabores</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-slate-600">Usuário</label>
              <input
                type="text"
                className="w-full border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-orange-500"
                value={loginData.username}
                onChange={e => setLoginData({ ...loginData, username: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-slate-600">Senha</label>
              <input
                type="password"
                className="w-full border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-orange-500"
                value={loginData.password}
                onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all uppercase tracking-wider">
              ENTRAR NO SISTEMA
            </button>
          </form>
          <p className="text-center text-slate-400 text-xs mt-6 uppercase tracking-widest font-bold italic">v1.2</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-orange-600 text-white p-6 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Fábrica de Polpas & Licores</h1>
          <p className="text-orange-100 opacity-90 text-sm">Controle de Estoque e Produção</p>
        </div>
        <button onClick={() => setIsLoggedIn(false)} className="bg-orange-700 hover:bg-orange-800 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-colors">SAIR</button>
      </header>

      <nav className="sticky top-0 z-10 bg-white border-b shadow-sm overflow-x-auto">
        <div className="max-w-4xl mx-auto flex p-2 gap-2">
          {[
            { id: 'estoque', label: '🍎 Comprar Fruta' },
            { id: 'polpas', label: '🧊 Fazer Polpa' },
            { id: 'licores', label: '🍷 Fazer Licor' },
            { id: 'vendas', label: '💰 Vender' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-6 py-3 rounded-full font-bold transition-all ${activeTab === tab.id ? 'bg-orange-500 text-white shadow-lg scale-105' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-4 md:p-8">
        {loading && <div className="text-center py-4 font-bold text-orange-600 animate-pulse">Sincronizando...</div>}

        {activeTab === 'estoque' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">Registrar Compra de Fruta</h2>
              <form onSubmit={handleAddIngredient} className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-slate-600">Nome da Fruta</label>
                  <input type="text" placeholder="Ex: Acerola, Caju..." className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-orange-400 outline-none transition-colors" value={newIngredient.name} onChange={e => setNewIngredient({ ...newIngredient, name: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-slate-600">Quantidade (kg)</label>
                    <input type="number" step="0.01" placeholder="0.00" className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-orange-400 outline-none transition-colors" value={newIngredient.quantity} onChange={e => setNewIngredient({ ...newIngredient, quantity: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-slate-600">Preço Pago (R$ total)</label>
                    <input type="number" step="0.01" placeholder="0.00" className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-orange-400 outline-none transition-colors" value={newIngredient.unitCost} onChange={e => setNewIngredient({ ...newIngredient, unitCost: e.target.value })} required />
                  </div>
                </div>
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all uppercase tracking-wider">SALVAR NO ESTOQUE</button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold mb-4 text-orange-600">Frutas no Estoque Digital</h2>
              <div className="overflow-hidden rounded-xl border border-slate-100">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Insumo</th>
                      <th className="p-4 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ingredients.map((ing: any) => (
                      <tr key={ing.id} className="hover:bg-orange-50/30 transition-colors">
                        <td className="p-4 font-semibold text-slate-700">{ing.name}</td>
                        <td className="p-4 text-right font-black text-orange-600 text-lg">{ing.quantity.toFixed(2)} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'polpas' || activeTab === 'licores') && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold mb-4 uppercase text-slate-800">Fabricação de {activeTab}</h2>
              <form onSubmit={(e) => handleProduction(e, activeTab === 'polpas' ? 'POLPA' : 'LICOR')} className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-slate-600">Qual fruta vai usar?</label>
                  <select className="w-full border-2 border-slate-100 p-3 rounded-xl bg-white outline-none focus:border-orange-400" value={newProduction.ingredientName} onChange={e => setNewProduction({ ...newProduction, ingredientName: e.target.value })} required>
                    <option value="">Selecione...</option>
                    {ingredients.map((ing: any) => <option key={ing.id} value={ing.name}>{ing.name} (Saldo: {ing.quantity}kg)</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-slate-600">Quantos kg de fruta vai usar?</label>
                  <input type="number" step="0.01" placeholder="Ex: 5" className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none focus:border-orange-400" value={newProduction.ingredientUsed} onChange={e => setNewProduction({ ...newProduction, ingredientUsed: e.target.value })} required />
                </div>
                <div className="p-5 bg-orange-50/50 rounded-2xl border-2 border-dashed border-orange-200">
                  <label className="block text-sm font-semibold mb-1 text-slate-700">Nome do Produto Final</label>
                  <input type="text" placeholder={`Ex: ${activeTab === 'polpas' ? 'Polpa de Manga' : 'Licor de Jabuticaba'}`} className="w-full border-2 border-white p-3 rounded-xl mb-4 shadow-sm" value={newProduction.productName} onChange={e => setNewProduction({ ...newProduction, productName: e.target.value })} required />
                  <label className="block text-sm font-semibold mb-1 text-slate-700">Quanto rendeu? ({activeTab === 'polpas' ? 'kg' : 'garrafas'})</label>
                  <input type="number" step="0.01" placeholder="0" className="w-full border-2 border-white p-3 rounded-xl shadow-sm" value={newProduction.outputQuantity} onChange={e => setNewProduction({ ...newProduction, outputQuantity: e.target.value })} required />
                </div>
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg uppercase tracking-wider">FINALIZAR PRODUÇÃO</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'vendas' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold mb-4 text-slate-800">Registrar Venda</h2>
              <form onSubmit={handleSale} className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-slate-600">Produto Vendido</label>
                  <select className="w-full border-2 border-slate-100 p-3 rounded-xl bg-white outline-none focus:border-orange-400" value={newSale.productName} onChange={e => setNewSale({ ...newSale, productName: e.target.value })} required>
                    <option value="">Selecione...</option>
                    {products.map((p: any) => <option key={p.id} value={p.name}>{p.name} (Saldo: {p.quantity})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-slate-600">Quantidade</label>
                    <input type="number" step="0.01" className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none focus:border-orange-400" value={newSale.quantity} onChange={e => setNewSale({ ...newSale, quantity: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-slate-600">Preço Total (R$)</label>
                    <input type="number" step="0.01" className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none focus:border-orange-400" value={newSale.totalValue} onChange={e => setNewSale({ ...newSale, totalValue: e.target.value })} required />
                  </div>
                </div>
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg uppercase tracking-wider">CONFIRMAR VENDA</button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold mb-4 text-orange-600 uppercase tracking-tight">Histórico de Vendas</h2>
              <div className="space-y-3">
                {salesHistory.map((s: any) => (
                  <div key={s.id} className="flex justify-between items-center p-4 bg-orange-50/20 rounded-2xl border border-orange-100">
                    <div>
                      <div className="font-bold text-slate-800 text-lg">{s.productName}</div>
                      <div className="text-xs font-bold text-slate-400 uppercase">{new Date(s.date).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-orange-600 text-xl">R$ {s.totalValue.toFixed(2)}</div>
                      <div className="text-xs font-bold text-slate-500 uppercase">Qtd: {s.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
