import { useState, useEffect } from 'react';
import { Menu, Search, Bell, LogOut, ChevronDown, ChevronUp, Package, Apple, Wine, ShoppingCart, DollarSign, X, AlertTriangle, Leaf, Edit, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const formatNum = (num: any) => {
  return parseFloat(num).toString().replace('.', ',');
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  const [activeTab, setActiveTab] = useState('estoque');
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [salesHistory, setSalesHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newIngredient, setNewIngredient] = useState({ id: null, name: '', quantity: '', unitCost: '' });
  const [newProduction, setNewProduction] = useState({ productName: '', ingredientName: '', ingredientUsed: '', outputQuantity: '' });
  const [newSale, setNewSale] = useState({ productName: '', quantity: '', totalValue: '' });

  // Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editType, setEditType] = useState(''); // 'ingredient' or 'product'

  // New UI states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Derived states
  const lowStockIngredients = ingredients.filter(ing => ing.quantity <= 10);
  const hasNotifications = lowStockIngredients.length > 0;

  const filteredIngredients = ingredients.filter(ing => ing.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredSales = salesHistory.filter(s => s.productName.toLowerCase().includes(searchTerm.toLowerCase()));

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
      const [ing, prod, sales] = await Promise.all([
        fetch(`${API_URL}/ingredients`).then(res => res.json()),
        fetch(`${API_URL}/products`).then(res => res.json()),
        fetch(`${API_URL}/sales`).then(res => res.json()),
      ]);
      setIngredients(Array.isArray(ing) ? ing : []);
      setProducts(Array.isArray(prod) ? prod : []);
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
    let url = '';
    if (editType === 'ingredient') url = `${API_URL}/ingredients/${editingItem.id}`;
    else if (editType === 'product') url = `${API_URL}/products/${editingItem.id}`;
    else if (editType === 'sale') url = `${API_URL}/sales/${editingItem.id}`;

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

  // NavItem Component Helper
  const NavItem = ({ icon, label, id }: { icon: any, label: string, id: string }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group/item ${isActive ? 'bg-white/20 font-bold' : 'hover:bg-white/10'
          }`}
      >
        <div className="shrink-0">{icon}</div>
        <span className="whitespace-nowrap opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
          {label}
        </span>
      </button>
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 to-green-900 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden">
          <div className="absolute top-[-50px] right-[-50px] text-orange-100 opacity-50">
            <Leaf size={200} />
          </div>
          <div className="flex flex-col items-center mb-8 relative z-10">
            <img src="/logo.png" alt="Deliciosos Sabores do Campo" className="w-80 scale-110 h-auto object-contain mb-2 mx-auto drop-shadow-2xl" />
            <p className="text-slate-500 font-medium mt-1">Sistema de Gestão</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5 relative z-10">
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-600 uppercase tracking-wider">Usuário</label>
              <input
                type="text"
                placeholder="Seu usuário"
                className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-orange-500 bg-slate-50 font-medium text-slate-700 transition-colors"
                value={loginData.username}
                onChange={e => setLoginData({ ...loginData, username: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-600 uppercase tracking-wider">Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-orange-500 bg-slate-50 font-medium text-slate-700 transition-colors"
                value={loginData.password}
                onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-500/30 active:scale-95 transition-all uppercase tracking-widest mt-4">
              ACESSAR PAINEL
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Determine Tab Titles
  let tabTitle = "Painel Principal";
  let tabSubtitle = "Visão geral do seu negócio";
  if (activeTab === 'estoque') { tabTitle = "Estoque & Insumos"; tabSubtitle = "Gerenciamento de Insumos & Matérias-Primas"; }
  if (activeTab === 'polpas') { tabTitle = "Produção de Polpas"; tabSubtitle = "Controle de fabricação de polpas"; }
  if (activeTab === 'licores') { tabTitle = "Produção de Licores"; tabSubtitle = "Controle de fabricação de licores"; }
  if (activeTab === 'vendas') { tabTitle = "Vendas e Pedidos"; tabSubtitle = "Registre e acompanhe suas saídas"; }
  if (activeTab === 'financeiro') { tabTitle = "Visão Financeira"; tabSubtitle = "Controle de custos e preços"; }

  return (
    <div className="min-h-screen bg-[#f8faf8] flex overflow-hidden font-sans text-slate-800">

      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex flex-col bg-gradient-to-b from-orange-500 to-green-900 text-white w-24 hover:w-80 transition-all duration-300 ease-in-out z-30 group relative shrink-0 shadow-2xl">
        {/* Logo Area */}
        <div className="px-0 py-8 flex items-center justify-center h-32 mt-2 w-full">
          <img src="/logo.png" alt="Logo" className="w-full group-hover:w-72 transition-all duration-300 ease-in-out object-contain drop-shadow-2xl" />
        </div>
        {/* Nav Items */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-x-hidden">
          <NavItem icon={<Apple size={30} />} label="Estoque de Frutas" id="estoque" />
          <NavItem icon={<Package size={30} />} label="Produção de Polpas" id="polpas" />
          <NavItem icon={<Wine size={30} />} label="Produção de Licores" id="licores" />
          <NavItem icon={<ShoppingCart size={30} />} label="Vendas e Pedidos" id="vendas" />
          <NavItem icon={<DollarSign size={30} />} label="Painel Financeiro" id="financeiro" />
        </nav>
      </aside>

      {/* MOBILE OVERLAY & MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative bg-gradient-to-b from-orange-500 to-green-900 text-white w-80 h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            <div className="p-6 flex items-center justify-between mt-2">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Logo" className="w-56 object-contain drop-shadow-2xl" />
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} className="text-white/80" /></button>
            </div>
            <nav className="flex-1 px-4 py-4 flex flex-col gap-2">
              <NavItem icon={<Apple size={20} />} label="Estoque de Frutas" id="estoque" />
              <NavItem icon={<Package size={20} />} label="Produção de Polpas" id="polpas" />
              <NavItem icon={<Wine size={20} />} label="Produção de Licores" id="licores" />
              <NavItem icon={<ShoppingCart size={20} />} label="Vendas e Pedidos" id="vendas" />
              <NavItem icon={<DollarSign size={20} />} label="Painel Financeiro" id="financeiro" />
            </nav>
            <div className="p-6 border-t border-white/10">
              <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-3 text-white/80 font-bold hover:text-white w-full px-4 py-2">
                <LogOut size={20} /> Sair do Sistema
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">

        {/* TOP HEADER */}
        <header className="bg-white px-4 md:px-8 py-4 flex justify-between items-center shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] z-20 shrink-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 bg-orange-50 text-orange-600 rounded-xl" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center bg-slate-50 border border-slate-100 rounded-full px-4 py-2.5 focus-within:border-orange-300 focus-within:bg-white transition-all w-80">
              <Search size={18} className="text-slate-400" />
              <input type="text" placeholder="Buscar..." className="bg-transparent border-none outline-none ml-3 text-sm w-full font-medium text-slate-700" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="relative cursor-pointer" title={hasNotifications ? `${lowStockIngredients.length} insumos com estoque baixo` : 'Sem notificações'}>
              <Bell size={22} className="text-slate-400 hover:text-orange-500 transition-colors" />
              {hasNotifications && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
            </div>
            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-orange-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-orange-600 font-bold uppercase">
                {loginData.username ? loginData.username.substring(0, 1) : 'U'}
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-sm font-bold text-slate-700 leading-none capitalize">{loginData.username || 'Usuário'} <ChevronDown size={14} className="inline text-slate-400 ml-1" /></span>
              </div>
            </div>
            <button onClick={() => setIsLoggedIn(false)} className="hidden md:flex items-center gap-2 border border-orange-200 text-orange-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-50 transition-colors shadow-sm">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>

        {/* SCROLLABLE MAIN */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {/* Subtle Watermark background */}
          <div className="fixed bottom-0 right-0 pointer-events-none opacity-[0.03] z-0 transform translate-x-1/4 translate-y-1/4">
            <Leaf size={800} />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto space-y-8">

            {/* Page Header */}
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">{tabTitle}</h2>
              <p className="text-slate-500 font-medium mt-1">{tabSubtitle}</p>
            </div>

            {loading && <div className="text-center py-4 font-bold text-orange-600 animate-pulse bg-orange-50 rounded-xl">Sincronizando dados...</div>}

            {/* TAB CONTENT: ESTOQUE */}
            {activeTab === 'estoque' && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Insumos Ativos</p>
                      <h3 className="text-4xl font-black text-slate-800">{ingredients.length}</h3>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                      <Apple size={32} />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Lotes Críticos</p>
                      <h3 className="text-4xl font-black text-slate-800">{lowStockIngredients.length}</h3>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                      <AlertTriangle size={32} />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Pedidos Ativos</p>
                      <h3 className="text-4xl font-black text-slate-800">0</h3>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                      <ShoppingCart size={32} />
                    </div>
                  </div>
                </div>

                {/* Form & Table Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                  {/* Left Column: Form */}
                  <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 lg:col-span-1 h-fit">
                    <h2 className="text-xl font-black mb-6 text-slate-800 tracking-tight">
                      {newIngredient.id ? 'Editar Fruta' : 'Nova Adição ao Estoque'}
                    </h2>
                    <form onSubmit={handleAddIngredient} className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold mb-2 text-slate-500 uppercase tracking-widest">Insumo</label>
                        <input type="text" placeholder="Ex: Acerola, Caju..." className="w-full border-2 border-slate-100 p-3.5 rounded-2xl focus:border-orange-500 outline-none transition-colors font-medium text-slate-700 bg-slate-50" value={newIngredient.name} onChange={e => setNewIngredient({ ...newIngredient, name: e.target.value })} required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-2 text-slate-500 uppercase tracking-widest">Quantidade (kg)</label>
                        <input type="number" step="any" placeholder="0.00" className="w-full border-2 border-slate-100 p-3.5 rounded-2xl focus:border-orange-500 outline-none transition-colors font-medium text-slate-700 bg-slate-50" value={newIngredient.quantity} onChange={e => setNewIngredient({ ...newIngredient, quantity: e.target.value })} required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-2 text-slate-500 uppercase tracking-widest">Preço Pago (R$ total)</label>
                        <input type="number" step="any" placeholder="0.00" className="w-full border-2 border-slate-100 p-3.5 rounded-2xl focus:border-orange-500 outline-none transition-colors font-medium text-slate-700 bg-slate-50" value={newIngredient.unitCost} onChange={e => setNewIngredient({ ...newIngredient, unitCost: e.target.value })} required />
                      </div>
                      <div className="pt-2">
                        <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all uppercase tracking-widest">
                          {newIngredient.id ? 'ATUALIZAR' : 'SALVAR NO ESTOQUE'}
                        </button>
                        {newIngredient.id && (
                          <button type="button" onClick={() => setNewIngredient({ id: null, name: '', quantity: '', unitCost: '' })} className="w-full mt-3 bg-slate-100 hover:bg-slate-200 py-3 rounded-2xl font-bold text-slate-500 uppercase transition-colors">CANCELAR</button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Right Column: Table / Accordion */}
                  <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-black text-slate-800 tracking-tight">Insumos no Estoque</h2>
                      <div className="md:hidden text-3xl font-black text-slate-800">{ingredients.length}</div>
                    </div>

                    {/* Desktop Table (Hidden on mobile) */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b-2 border-slate-100">
                            <th className="py-4 px-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Insumo</th>
                            <th className="py-4 px-2 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Saldo (kg)</th>
                            <th className="py-4 px-2 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredIngredients.map((ing: any) => (
                            <tr key={ing.id} className="hover:bg-slate-50 transition-colors group/row">
                              <td className="py-4 px-2 font-bold text-slate-700">{ing.name}</td>
                              <td className="py-4 px-2 font-black text-orange-600 text-right">{formatNum(ing.quantity)} kg</td>
                              <td className="py-4 px-2 text-center">
                                <button onClick={() => openEditModal(ing, 'ingredient')} className="text-orange-500 hover:text-orange-700 font-bold text-xs uppercase tracking-widest transition-colors opacity-0 group-hover/row:opacity-100">
                                  Editar | Baixa
                                </button>
                              </td>
                            </tr>
                          ))}
                          {filteredIngredients.length === 0 && (
                            <tr><td colSpan={3} className="py-8 text-center text-slate-400 font-medium">Nenhum insumo encontrado.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Accordion List (Hidden on desktop) */}
                    <div className="md:hidden space-y-3">
                      {filteredIngredients.map((ing: any) => (
                        <div key={ing.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                          <button
                            className="w-full flex justify-between items-center p-4"
                            onClick={() => setExpandedRow(expandedRow === ing.id ? null : ing.id)}
                          >
                            <div className="font-bold text-slate-800 text-left">{ing.name} - <span className="text-slate-500 font-medium">{formatNum(ing.quantity)}kg</span></div>
                            <div className="text-slate-400">{expandedRow === ing.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
                          </button>
                          {expandedRow === ing.id && (
                            <div className="px-4 pb-4 pt-2 bg-slate-50 border-t border-slate-100 flex gap-2">
                              <button onClick={() => openEditModal(ing, 'ingredient')} className="flex-1 bg-white border border-slate-200 py-2 rounded-xl text-orange-600 font-bold text-sm uppercase flex items-center justify-center gap-2 shadow-sm">
                                <Edit size={16} /> Editar
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      {filteredIngredients.length === 0 && (
                        <div className="py-8 text-center text-slate-400 font-medium border-2 border-dashed border-slate-200 rounded-2xl">Nenhum insumo encontrado.</div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TAB CONTENT: POLPAS / LICORES */}
            {(activeTab === 'polpas' || activeTab === 'licores') && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FORM */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 lg:col-span-1 h-fit">
                  <h2 className="text-xl font-black mb-6 text-slate-800 tracking-tight uppercase">Produzir {activeTab}</h2>
                  <form onSubmit={(e) => handleProduction(e, activeTab === 'polpas' ? 'POLPA' : 'LICOR')} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold mb-2 text-slate-500 uppercase tracking-widest">Fruta (Insumo)</label>
                      <select className="w-full border-2 border-slate-100 p-3.5 rounded-2xl bg-slate-50 outline-none focus:border-orange-500 font-medium text-slate-700" value={newProduction.ingredientName} onChange={e => setNewProduction({ ...newProduction, ingredientName: e.target.value })} required>
                        <option value="">Selecione...</option>
                        {ingredients.map((ing: any) => <option key={ing.id} value={ing.name}>{ing.name} ({ing.quantity}kg)</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2 text-slate-500 uppercase tracking-widest">Qtd Utilizada (kg)</label>
                      <input type="number" step="any" placeholder="0.00" className="w-full border-2 border-slate-100 p-3.5 rounded-2xl focus:border-orange-500 outline-none transition-colors font-medium text-slate-700 bg-slate-50" value={newProduction.ingredientUsed} onChange={e => setNewProduction({ ...newProduction, ingredientUsed: e.target.value })} required />
                    </div>
                    <div className="p-5 bg-orange-50 rounded-2xl border-2 border-orange-100 space-y-4">
                      <div>
                        <label className="block text-xs font-bold mb-2 text-orange-800 uppercase tracking-widest">Nome do Produto Final</label>
                        <input type="text" placeholder={`Ex: ${activeTab === 'polpas' ? 'Polpa de Manga' : 'Licor de Jabuticaba'}`} className="w-full border-2 border-white p-3.5 rounded-2xl shadow-sm font-bold text-slate-700" value={newProduction.productName} onChange={e => setNewProduction({ ...newProduction, productName: e.target.value })} required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-2 text-orange-800 uppercase tracking-widest">Rendimento ({activeTab === 'polpas' ? 'unidades' : 'garrafas'})</label>
                        <input type="number" step="any" placeholder="0" className="w-full border-2 border-white p-3.5 rounded-2xl shadow-sm font-bold text-slate-700" value={newProduction.outputQuantity} onChange={e => setNewProduction({ ...newProduction, outputQuantity: e.target.value })} required />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all uppercase tracking-widest mt-2">FINALIZAR PRODUÇÃO</button>
                  </form>
                </div>

                {/* LIST */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 lg:col-span-2">
                  <h2 className="text-xl font-black mb-6 text-slate-800 tracking-tight">Estoque de {activeTab}</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b-2 border-slate-100">
                          <th className="py-4 px-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Produto</th>
                          <th className="py-4 px-2 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Saldo</th>
                          <th className="py-4 px-2 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredProducts.filter((p: any) => p.type === (activeTab === 'polpas' ? 'POLPA' : 'LICOR')).map((p: any) => (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors group/row">
                            <td className="py-4 px-2 font-bold text-slate-700">{p.name}</td>
                            <td className="py-4 px-2 font-black text-slate-800 text-right">{formatNum(p.quantity)} {activeTab === 'polpas' ? 'un' : 'gar'}</td>
                            <td className="py-4 px-2 text-center">
                              <button onClick={() => openEditModal(p, 'product')} className="text-orange-500 hover:text-orange-700 font-bold text-xs uppercase tracking-widest transition-colors opacity-0 group-hover/row:opacity-100">Editar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: VENDAS */}
            {activeTab === 'vendas' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 h-fit">
                  <h2 className="text-xl font-black mb-6 text-slate-800 tracking-tight">Registrar Saída/Venda</h2>
                  <form onSubmit={handleSale} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold mb-2 text-slate-500 uppercase tracking-widest">Produto Vendido</label>
                      <select className="w-full border-2 border-slate-100 p-3.5 rounded-2xl bg-slate-50 outline-none focus:border-orange-500 font-medium text-slate-700" value={newSale.productName} onChange={e => setNewSale({ ...newSale, productName: e.target.value })} required>
                        <option value="">Selecione...</option>
                        {products.map((p: any) => <option key={p.id} value={p.name}>{p.name} (Saldo: {p.quantity})</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-2 text-slate-500 uppercase tracking-widest">Quantidade</label>
                        <input type="number" step="any" className="w-full border-2 border-slate-100 p-3.5 rounded-2xl focus:border-orange-500 outline-none transition-colors font-medium text-slate-700 bg-slate-50" value={newSale.quantity} onChange={e => setNewSale({ ...newSale, quantity: e.target.value })} required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-2 text-slate-500 uppercase tracking-widest">Preço Total (R$)</label>
                        <input type="number" step="any" className="w-full border-2 border-slate-100 p-3.5 rounded-2xl focus:border-orange-500 outline-none transition-colors font-medium text-slate-700 bg-slate-50" value={newSale.totalValue} onChange={e => setNewSale({ ...newSale, totalValue: e.target.value })} required />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-green-500/20 active:scale-95 transition-all uppercase tracking-widest mt-2">CONFIRMAR VENDA</button>
                  </form>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                  <h2 className="text-xl font-black mb-6 text-slate-800 tracking-tight">Histórico Recente</h2>
                  <div className="space-y-4">
                    {filteredSales.map((s: any) => (
                      <div key={s.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors group/row">
                        <div>
                          <div className="font-bold text-slate-800">{s.productName}</div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{new Date(s.date).toLocaleDateString()}</div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <div className="font-black text-green-600 text-xl">R$ {formatNum(s.totalValue)}</div>
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Qtd: {formatNum(s.quantity)}</div>
                          <button onClick={() => openEditModal(s, 'sale')} className="text-blue-500 hover:text-blue-700 font-bold text-[10px] uppercase border border-blue-100 px-2 py-1 rounded-md mt-1 opacity-0 group-hover/row:opacity-100 transition-opacity">Editar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: FINANCEIRO */}
            {activeTab === 'financeiro' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Investido (Frutas)</div>
                    <div className="text-4xl font-black text-slate-800">R$ {formatNum(ingredients.reduce((acc: any, ing: any) => acc + (ing.quantity * ing.unitCost), 0))}</div>
                  </div>
                  <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Potencial de Venda</div>
                    <div className="text-4xl font-black text-orange-500">R$ {formatNum(products.reduce((acc: any, p: any) => acc + (p.quantity * p.unitPrice), 0))}</div>
                  </div>
                  <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Lucro Esperado</div>
                    <div className="text-4xl font-black text-green-500">R$ {formatNum(products.reduce((acc: any, p: any) => acc + (p.quantity * p.unitPrice), 0) - ingredients.reduce((acc: any, ing: any) => acc + (ing.quantity * ing.unitCost), 0))}</div>
                  </div>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                  <h2 className="text-xl font-black mb-6 text-slate-800 tracking-tight">Definir Preços de Venda</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredProducts.map((p: any) => (
                      <div key={p.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between gap-4">
                        <div>
                          <div className="font-bold text-slate-800 text-lg leading-tight">{p.name}</div>
                          <div className="text-sm text-slate-500 font-medium">Estoque: {formatNum(p.quantity)} un</div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-slate-400 font-bold">R$</span>
                          <input
                            type="number"
                            step="any"
                            className="w-full border-2 border-white p-3 rounded-xl shadow-sm focus:border-orange-500 outline-none font-black text-orange-600 bg-white"
                            value={p.unitPrice}
                            onChange={async (e) => {
                              const newPrice = parseFloat(e.target.value);
                              await fetch(`${API_URL}/products/${p.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ unitPrice: newPrice }) });
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

          </div>
        </main>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border-t-8 border-orange-500 animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-6">Ajustar Registro</h2>
              <form onSubmit={handleUpdateItem} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nome do Item</label>
                  <input type="text" className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-orange-500 outline-none font-bold text-slate-700 bg-slate-50" value={editingItem.name} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Quantidade</label>
                    <input type="number" step="any" className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-orange-500 outline-none font-bold text-slate-700 bg-slate-50" value={editingItem.quantity} onChange={e => setEditingItem({ ...editingItem, quantity: e.target.value })} required />
                  </div>
                  {editType === 'ingredient' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Preço (R$)</label>
                      <input type="number" step="any" className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-orange-500 outline-none font-bold text-slate-700 bg-slate-50" value={editingItem.unitCost} onChange={e => setEditingItem({ ...editingItem, unitCost: e.target.value })} required />
                    </div>
                  )}
                  {editType === 'product' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Venda (R$)</label>
                      <input type="number" step="any" className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-orange-500 outline-none font-bold text-slate-700 bg-slate-50" value={editingItem.unitPrice} onChange={e => setEditingItem({ ...editingItem, unitPrice: e.target.value })} required />
                    </div>
                  )}
                  {editType === 'sale' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Total (R$)</label>
                      <input type="number" step="any" className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-orange-500 outline-none font-bold text-slate-700 bg-slate-50" value={editingItem.totalValue} onChange={e => setEditingItem({ ...editingItem, totalValue: e.target.value })} required />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3 pt-4">
                  <div className="flex gap-3">
                    <button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 uppercase tracking-widest">SALVAR</button>
                    <button type="button" onClick={() => setShowEditModal(false)} className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-2xl transition-all uppercase tracking-widest">SAIR</button>
                  </div>
                  <button type="button" onClick={async () => {
                    if (confirm(`Tem certeza que deseja apagar permanentemente este registro?`)) {
                      let url = '';
                      if (editType === 'ingredient') url = `${API_URL}/ingredients/${editingItem.id}`;
                      else if (editType === 'product') url = `${API_URL}/products/${editingItem.id}`;
                      else if (editType === 'sale') url = `${API_URL}/sales/${editingItem.id}`;
                      await fetch(url, { method: 'DELETE' });
                      setShowEditModal(false);
                      fetchData();
                    }
                  }} className="w-full py-3 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold text-xs uppercase transition-colors rounded-xl tracking-widest">
                    <Trash2 size={14} className="inline mr-1 mb-0.5" /> Excluir Registro
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
