import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3000';

const formatNum = (num: any) => {
  return parseFloat(num).toString().replace('.', ',');
};

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
  const [newIngredient, setNewIngredient] = useState({ id: null, name: '', quantity: '', unitCost: '' });
  const [newProduction, setNewProduction] = useState({ productName: '', ingredientName: '', ingredientUsed: '', outputQuantity: '' });
  const [newSale, setNewSale] = useState({ productName: '', quantity: '', totalValue: '' });

  // Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editType, setEditType] = useState(''); // 'ingredient' or 'product'

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

  const openEditModal = (item: any, type: string) => {
    setEditingItem({ ...item });
    setEditType(type);
    setShowEditModal(true);
  };

  const handleUpdateItem = async (e: any) => {
    e.preventDefault();
    const url = editType === 'ingredient' ? `${API_URL}/ingredients/${editingItem.id}` : `${API_URL}/products/${editingItem.id}`;
    await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingItem),
    });
    setShowEditModal(false);
    fetchData();
  };

  const handleAddIngredient = async (e: any) => {
    e.preventDefault();
    const url = newIngredient.id ? `${API_URL}/ingredients/${newIngredient.id}` : `${API_URL}/ingredients`;
    const method = newIngredient.id ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newIngredient.name,
        quantity: parseFloat(newIngredient.quantity as string),
        unitCost: parseFloat(newIngredient.unitCost as string)
      }),
    });
    setNewIngredient({ id: null, name: '', quantity: '', unitCost: '' });
    fetchData();
  };

  const handleDeleteIngredient = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta fruta do estoque?')) {
      await fetch(`${API_URL}/ingredients/${id}`, { method: 'DELETE' });
      fetchData();
    }
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
          <h1 className="text-2xl font-bold text-center text-orange-600 mb-6 uppercase tracking-tight">Acesso ao ERP</h1>
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
          <p className="text-center text-slate-400 text-xs mt-6 uppercase tracking-widest font-bold italic">Polpas & Licores v2.0</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-orange-600 text-white p-6 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Doces Sabores</h1>
          <p className="text-orange-100 opacity-90 text-sm">Controle de Estoque e Produção</p>
        </div>
        <button onClick={() => setIsLoggedIn(false)} className="bg-orange-700 hover:bg-orange-800 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-colors">SAIR</button>
      </header>

      <nav className="sticky top-0 z-10 bg-white border-b shadow-sm overflow-x-auto">
        <div className="max-w-4xl mx-auto flex p-2 gap-2">
          {[
            { id: 'estoque', label: 'Frutas' },
            { id: 'polpas', label: 'Polpas' },
            { id: 'licores', label: 'Licor' },
            { id: 'vendas', label: 'Vender' },
            { id: 'financeiro', label: 'Financeiro' }
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
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                {newIngredient.id ? 'Editando Fruta' : 'Registrar Compra de Fruta'}
              </h2>
              <form onSubmit={handleAddIngredient} className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-slate-600">Nome da Fruta</label>
                  <input type="text" placeholder="Ex: Acerola, Caju..." className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-orange-400 outline-none transition-colors" value={newIngredient.name} onChange={e => setNewIngredient({ ...newIngredient, name: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-slate-600">Quantidade (kg)</label>
                    <input type="number" step="any" placeholder="0.00" className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-orange-400 outline-none transition-colors" value={newIngredient.quantity} onChange={e => setNewIngredient({ ...newIngredient, quantity: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-slate-600">Preço Pago (R$ total)</label>
                    <input type="number" step="any" placeholder="0.00" className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-orange-400 outline-none transition-colors" value={newIngredient.unitCost} onChange={e => setNewIngredient({ ...newIngredient, unitCost: e.target.value })} required />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all uppercase tracking-wider">
                    {newIngredient.id ? 'ATUALIZAR' : 'SALVAR NO ESTOQUE'}
                  </button>
                  {newIngredient.id && (
                    <button type="button" onClick={() => setNewIngredient({ id: null, name: '', quantity: '', unitCost: '' })} className="bg-slate-200 px-6 rounded-xl font-bold text-slate-600">CANCELAR</button>
                  )}
                </div>
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
                      <th className="p-4 text-sm font-bold text-slate-500 uppercase tracking-wider text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ingredients.map((ing: any) => (
                      <tr key={ing.id} className="hover:bg-orange-50/30 transition-colors">
                        <td className="p-4 font-semibold text-slate-700">{ing.name}</td>
                        <td className="p-4 text-right font-black text-orange-600 text-lg">{formatNum(ing.quantity)} kg</td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-3">
                            <button onClick={() => openEditModal(ing, 'ingredient')} className="text-blue-500 hover:text-blue-700 font-bold text-xs uppercase transition-colors">EDITAR</button>
                          </div>
                        </td>
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
                  <input type="number" step="any" placeholder="Ex: 5" className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none focus:border-orange-400" value={newProduction.ingredientUsed} onChange={e => setNewProduction({ ...newProduction, ingredientUsed: e.target.value })} required />
                </div>
                <div className="p-5 bg-orange-50/50 rounded-2xl border-2 border-dashed border-orange-200">
                  <label className="block text-sm font-semibold mb-1 text-slate-700">Nome do Produto Final</label>
                  <input type="text" placeholder={`Ex: ${activeTab === 'polpas' ? 'Polpa de Manga' : 'Licor de Jabuticaba'}`} className="w-full border-2 border-white p-3 rounded-xl mb-4 shadow-sm" value={newProduction.productName} onChange={e => setNewProduction({ ...newProduction, productName: e.target.value })} required />
                  <label className="block text-sm font-semibold mb-1 text-slate-700">Quanto rendeu? ({activeTab === 'polpas' ? 'unidades' : 'garrafas'})</label>
                  <input type="number" step="any" placeholder="0" className="w-full border-2 border-white p-3 rounded-xl shadow-sm" value={newProduction.outputQuantity} onChange={e => setNewProduction({ ...newProduction, outputQuantity: e.target.value })} required />
                </div>
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg uppercase tracking-wider">FINALIZAR PRODUÇÃO</button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold mb-4 text-orange-600 uppercase tracking-tight">Produtos em Estoque ({activeTab})</h2>
              <div className="overflow-hidden rounded-xl border border-slate-100">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Produto</th>
                      <th className="p-4 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">Saldo</th>
                      <th className="p-4 text-sm font-bold text-slate-500 uppercase tracking-wider text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.filter((p: any) => p.type === (activeTab === 'polpas' ? 'POLPA' : 'LICOR')).map((p: any) => (
                      <tr key={p.id} className="hover:bg-orange-50/30 transition-colors">
                        <td className="p-4 font-semibold text-slate-700">{p.name}</td>
                        <td className="p-4 text-right font-black text-orange-600 text-lg">
                          {formatNum(p.quantity)} {activeTab === 'polpas' ? 'un' : 'gar'}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() => openEditModal(p, 'product')}
                              className="text-blue-500 hover:text-blue-700 font-bold text-xs uppercase transition-colors"
                            >
                              EDITAR
                            </button>
                          </div>
                        </td>                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                    <input type="number" step="any" className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none focus:border-orange-400" value={newSale.quantity} onChange={e => setNewSale({ ...newSale, quantity: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-slate-600">Preço Total (R$)</label>
                    <input type="number" step="any" className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none focus:border-orange-400" value={newSale.totalValue} onChange={e => setNewSale({ ...newSale, totalValue: e.target.value })} required />
                  </div>
                </div>
                <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg uppercase tracking-wider">CONFIRMAR VENDA</button>
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
                      <div className="font-black text-orange-600 text-xl">R$ {formatNum(s.totalValue)}</div>
                      <div className="text-xs font-bold text-slate-500 uppercase">Qtd: {formatNum(s.quantity)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'financeiro' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Investido</div>
                <div className="text-2xl font-black text-slate-800">
                  R$ {formatNum(ingredients.reduce((acc: any, ing: any) => acc + (ing.quantity * ing.unitCost), 0))}
                </div>
                <div className="text-xs text-slate-500 mt-1">Valor em frutas no estoque</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Potencial de Venda</div>
                <div className="text-2xl font-black text-orange-600">
                  R$ {formatNum(products.reduce((acc: any, p: any) => acc + (p.quantity * p.unitPrice), 0))}
                </div>
                <div className="text-xs text-slate-500 mt-1">Valor total se vender tudo</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Lucro Esperado</div>
                <div className="text-2xl font-black text-green-600">
                  R$ {formatNum(products.reduce((acc: any, p: any) => acc + (p.quantity * p.unitPrice), 0) - ingredients.reduce((acc: any, ing: any) => acc + (ing.quantity * ing.unitCost), 0))}
                </div>
                <div className="text-xs text-slate-500 mt-1">Estimativa de lucro bruto</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold mb-4 text-slate-800 uppercase tracking-tight">Definir Preços de Venda</h2>
              <p className="text-sm text-slate-500 mb-6 font-medium uppercase">Ajuste o valor pelo qual você vende cada produto:</p>
              <div className="space-y-4">
                {products.map((p: any) => (
                  <div key={p.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 gap-4">
                    <div className="font-bold text-slate-700 text-lg uppercase tracking-wide">{p.name} <span className="text-sm text-slate-400 font-medium ml-2">(Saldo: {formatNum(p.quantity)})</span></div>
                    <div className="flex items-center gap-3">
                      <div className="text-slate-500 font-bold uppercase text-xs">Preço Venda (R$):</div>
                      <input
                        type="number"
                        step="any"
                        className="w-24 border-2 border-white p-2 rounded-xl shadow-sm focus:border-orange-400 outline-none font-bold text-orange-600"
                        value={p.unitPrice}
                        onChange={async (e) => {
                          const newPrice = parseFloat(e.target.value);
                          await fetch(`${API_URL}/products/${p.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ unitPrice: newPrice }),
                          });
                          fetchData();
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE EDIÇÃO BONITO */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border-t-8 border-orange-500 animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-6">Ajustar Registro</h2>
              <form onSubmit={handleUpdateItem} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Nome do Item</label>
                  <input
                    type="text"
                    className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-orange-500 outline-none font-bold text-slate-700 bg-slate-50"
                    value={editingItem.name}
                    onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Quantidade</label>
                    <input
                      type="number"
                      step="any"
                      className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-orange-500 outline-none font-bold text-slate-700 bg-slate-50"
                      value={editingItem.quantity}
                      onChange={e => setEditingItem({ ...editingItem, quantity: e.target.value })}
                      required
                    />
                  </div>
                  {editType === 'ingredient' && (
                    <div>
                      <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Preço (R$)</label>
                      <input
                        type="number"
                        step="any"
                        className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-orange-500 outline-none font-bold text-slate-700 bg-slate-50"
                        value={editingItem.unitCost}
                        onChange={e => setEditingItem({ ...editingItem, unitCost: e.target.value })}
                        required
                      />
                    </div>
                  )}
                  {editType === 'product' && (
                    <div>
                      <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Venda (R$)</label>
                      <input
                        type="number"
                        step="any"
                        className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-orange-500 outline-none font-bold text-slate-700 bg-slate-50"
                        value={editingItem.unitPrice}
                        onChange={e => setEditingItem({ ...editingItem, unitPrice: e.target.value })}
                        required
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3 pt-4">
                  <div className="flex gap-3">
                    <button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 uppercase">SALVAR</button>
                    <button type="button" onClick={() => setShowEditModal(false)} className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-2xl transition-all uppercase">SAIR</button>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm(`Tem certeza que deseja apagar permanentemente: ${editingItem.name}?`)) {
                        const url = editType === 'ingredient' ? `${API_URL}/ingredients/${editingItem.id}` : `${API_URL}/products/${editingItem.id}`;
                        await fetch(url, { method: 'DELETE' });
                        setShowEditModal(false);
                        fetchData();
                      }
                    }}
                    className="w-full py-3 text-red-500 hover:text-red-700 font-bold text-xs uppercase transition-colors border-2 border-transparent hover:border-red-100 rounded-xl"
                  >
                    Excluir Registro permanentemente
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

export default App;
