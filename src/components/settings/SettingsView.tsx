import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Settings2, 
  Store, 
  Printer, 
  Percent, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle,
  AlertTriangle,
  Scale,
  FolderTree,
  Plus,
  Edit3,
  Trash2,
  Search,
  Tag,
  Boxes,
  HelpCircle,
  FileCode,
  X
} from 'lucide-react';
import { StoreSettings, UnitItem, Category } from '../../types';
import { formatRupiah } from '../../utils/formatters';

export const SettingsView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    units,
    addUnit,
    updateUnit,
    deleteUnit,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    ingredients,
    products,
    exportDataJson, 
    importDataJson, 
    resetAllData 
  } = useApp();

  const [activeTabSub, setActiveTabSub] = useState<'units' | 'categories' | 'profile' | 'printer' | 'database'>('units');
  const [formSettings, setFormSettings] = useState<StoreSettings>({ ...settings });
  const [saveNotice, setSaveNotice] = useState('');
  const [importStatus, setImportStatus] = useState<string>('');

  // -------------------------------------------------------------
  // UNIT MANAGEMENT STATE
  // -------------------------------------------------------------
  const [unitSearch, setUnitSearch] = useState('');
  const [unitFilterCat, setUnitFilterCat] = useState<string>('all');
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitItem | null>(null);
  const [unitCode, setUnitCode] = useState('');
  const [unitName, setUnitName] = useState('');
  const [unitCategory, setUnitCategory] = useState('Berat / Massa');
  const [unitDesc, setUnitDesc] = useState('');

  // -------------------------------------------------------------
  // CATEGORY MANAGEMENT STATE
  // -------------------------------------------------------------
  const [catSearch, setCatSearch] = useState('');
  const [catFilterType, setCatFilterType] = useState<string>('all');
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<'product' | 'ingredient' | 'general'>('product');
  const [catDesc, setCatDesc] = useState('');

  const handleChange = (field: keyof StoreSettings, val: any) => {
    setFormSettings(prev => ({ ...prev, [field]: val }));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    setSaveNotice('Pengaturan toko & printer thermal berhasil disimpan!');
    setTimeout(() => setSaveNotice(''), 3500);
  };

  // -------------------------------------------------------------
  // UNIT HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddUnit = () => {
    setEditingUnit(null);
    setUnitCode('');
    setUnitName('');
    setUnitCategory('Berat / Massa');
    setUnitDesc('');
    setIsUnitModalOpen(true);
  };

  const handleOpenEditUnit = (u: UnitItem) => {
    setEditingUnit(u);
    setUnitCode(u.code);
    setUnitName(u.name);
    setUnitCategory(u.category || 'Berat / Massa');
    setUnitDesc(u.description || '');
    setIsUnitModalOpen(true);
  };

  const handleSaveUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitCode.trim() || !unitName.trim()) return;

    if (editingUnit) {
      updateUnit(editingUnit.id, {
        code: unitCode.trim().toLowerCase(),
        name: unitName.trim(),
        category: unitCategory,
        description: unitDesc.trim() || undefined,
      });
      setSaveNotice(`Satuan "${unitName}" (${unitCode.toLowerCase()}) berhasil diperbarui!`);
    } else {
      // Check if duplicate code exists
      const exists = units.some(u => u.code.toLowerCase() === unitCode.trim().toLowerCase());
      if (exists) {
        alert(`Kode satuan "${unitCode}" sudah digunakan. Silakan gunakan kode unik lain.`);
        return;
      }
      addUnit({
        code: unitCode.trim().toLowerCase(),
        name: unitName.trim(),
        category: unitCategory,
        description: unitDesc.trim() || undefined,
      });
      setSaveNotice(`Satuan baru "${unitName}" (${unitCode.toLowerCase()}) berhasil ditambahkan!`);
    }

    setIsUnitModalOpen(false);
    setTimeout(() => setSaveNotice(''), 3500);
  };

  const handleDeleteUnit = (u: UnitItem) => {
    const isUsedInIngredients = ingredients.some(i => i.unit?.toLowerCase() === u.code.toLowerCase());
    const promptMsg = isUsedInIngredients
      ? `PERINGATAN: Satuan "${u.name}" (${u.code}) sedang digunakan oleh beberapa bahan baku di inventori. Apakah Anda yakin tetap ingin menghapusnya?`
      : `Yakin ingin menghapus jenis satuan "${u.name}" (${u.code})?`;

    if (confirm(promptMsg)) {
      deleteUnit(u.id);
      setSaveNotice(`Satuan "${u.name}" telah dihapus.`);
      setTimeout(() => setSaveNotice(''), 3500);
    }
  };

  // -------------------------------------------------------------
  // CATEGORY HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddCat = () => {
    setEditingCat(null);
    setCatName('');
    setCatType('product');
    setCatDesc('');
    setIsCatModalOpen(true);
  };

  const handleOpenEditCat = (c: Category) => {
    setEditingCat(c);
    setCatName(c.name);
    setCatType(c.type || 'product');
    setCatDesc(c.description || '');
    setIsCatModalOpen(true);
  };

  const handleSaveCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (editingCat) {
      updateCategory(editingCat.id, {
        name: catName.trim(),
        type: catType,
        description: catDesc.trim() || undefined,
      });
      setSaveNotice(`Kategori "${catName}" berhasil diperbarui!`);
    } else {
      addCategory({
        name: catName.trim(),
        type: catType,
        description: catDesc.trim() || undefined,
      });
      setSaveNotice(`Kategori baru "${catName}" berhasil ditambahkan!`);
    }

    setIsCatModalOpen(false);
    setTimeout(() => setSaveNotice(''), 3500);
  };

  const handleDeleteCat = (c: Category) => {
    const isUsedInProducts = products.some(p => p.categoryId === c.id || p.categoryName === c.name);
    const isUsedInIngredients = ingredients.some(i => i.category === c.name);

    let warning = `Yakin ingin menghapus kategori "${c.name}"?`;
    if (isUsedInProducts || isUsedInIngredients) {
      warning = `PERINGATAN: Kategori "${c.name}" saat ini digunakan oleh produk atau bahan baku terdaftar. Apakah Anda yakin ingin menghapusnya?`;
    }

    if (confirm(warning)) {
      deleteCategory(c.id);
      setSaveNotice(`Kategori "${c.name}" telah dihapus.`);
      setTimeout(() => setSaveNotice(''), 3500);
    }
  };

  // -------------------------------------------------------------
  // BACKUP & RESTORE
  // -------------------------------------------------------------
  const handleDownloadBackup = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `KHP_POS_V4_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDataJson(content);
      if (success) {
        setImportStatus('Data backup JSON berhasil dipulihkan dengan sukses!');
        setTimeout(() => setImportStatus(''), 4000);
      } else {
        alert('Gagal memulihkan data: Format file JSON tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  // Filtered lists
  const filteredUnits = units.filter(u => {
    const q = unitSearch.toLowerCase().trim();
    const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.code.toLowerCase().includes(q) || (u.description && u.description.toLowerCase().includes(q));
    const matchesCat = unitFilterCat === 'all' || u.category === unitFilterCat;
    return matchesSearch && matchesCat;
  });

  const filteredCategories = categories.filter(c => {
    const q = catSearch.toLowerCase().trim();
    const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q));
    const matchesType = catFilterType === 'all' || (c.type || 'product') === catFilterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/70 p-4 sm:p-6 select-none space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Settings2 className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl">
              Pengaturan Toko, Satuan & Kategori
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola jenis satuan takaran, kategori menu & bahan, profil outlet, printer thermal, serta database sistem.
          </p>
        </div>

        {/* Top Tab Bar */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTabSub('units')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTabSub === 'units'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Jenis Satuan</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTabSub === 'units' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {units.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSub('categories')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTabSub === 'categories'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Kategori Menu & Bahan</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTabSub === 'categories' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {categories.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSub('profile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTabSub === 'profile'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Profil Usaha & Pajak</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSub('printer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTabSub === 'printer'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Printer & Struk</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSub('database')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTabSub === 'database'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Backup Data</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-semibold shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveNotice}</span>
          </div>
          <button onClick={() => setSaveNotice('')} className="text-emerald-700 hover:text-emerald-950">✕</button>
        </div>
      )}

      {importStatus && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900 font-semibold shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{importStatus}</span>
          </div>
          <button onClick={() => setImportStatus('')} className="text-blue-700 hover:text-blue-950">✕</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: JENIS SATUAN (UNITS)                                               */}
      {/* ========================================================================= */}
      {activeTabSub === 'units' && (
        <div className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase mb-1">Total Jenis Satuan</div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">{units.length} Satuan</div>
              <p className="text-[11px] text-slate-400 mt-1">Digunakan untuk resep & stok</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase mb-1">Satuan Berat / Massa</div>
              <div className="text-2xl font-extrabold text-emerald-600 font-mono">
                {units.filter(u => u.category === 'Berat / Massa').length}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Gram, Kilogram, dll</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase mb-1">Satuan Volume / Cairan</div>
              <div className="text-2xl font-extrabold text-blue-600 font-mono">
                {units.filter(u => u.category === 'Volume / Cairan').length}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Mililiter, Liter, dll</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase mb-1">Satuan Kemasan & Porsi</div>
              <div className="text-2xl font-extrabold text-purple-600 font-mono">
                {units.filter(u => u.category === 'Kemasan' || u.category === 'Jumlah / Satuan').length}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Pcs, Cup, Botol, Porsi</p>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama satuan atau kode (gr, ml, cup)..."
                value={unitSearch}
                onChange={(e) => setUnitSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={unitFilterCat}
                onChange={(e) => setUnitFilterCat(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Semua Kategori Takaran</option>
                <option value="Berat / Massa">Berat / Massa</option>
                <option value="Volume / Cairan">Volume / Cairan</option>
                <option value="Jumlah / Satuan">Jumlah / Satuan</option>
                <option value="Kemasan">Kemasan</option>
                <option value="Takaran Dapur">Takaran Dapur</option>
                <option value="Lainnya">Lainnya</option>
              </select>

              <button
                type="button"
                onClick={handleOpenAddUnit}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Satuan Baru</span>
              </button>
            </div>
          </div>

          {/* Units Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Kode Satuan</th>
                    <th className="px-4 py-3">Nama Satuan</th>
                    <th className="px-4 py-3">Kategori Takaran</th>
                    <th className="px-4 py-3">Keterangan / Penggunaan</th>
                    <th className="px-4 py-3 text-center">Dipakai di Bahan</th>
                    <th className="px-4 py-3 text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUnits.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        Tidak ada jenis satuan yang sesuai dengan pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredUnits.map((u) => {
                      const countUsage = ingredients.filter(i => i.unit?.toLowerCase() === u.code.toLowerCase()).length;
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-mono font-extrabold text-slate-900 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-emerald-800 text-xs">
                              {u.code}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900">
                            {u.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.category === 'Berat / Massa' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                              u.category === 'Volume / Cairan' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                              u.category === 'Kemasan' ? 'bg-purple-50 text-purple-800 border border-purple-200' :
                              'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}>
                              {u.category || 'Jumlah / Satuan'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 max-w-sm truncate">
                            {u.description || '-'}
                          </td>
                          <td className="px-4 py-3 text-center font-mono font-bold whitespace-nowrap">
                            {countUsage > 0 ? (
                              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                {countUsage} Bahan
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">0 Bahan</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditUnit(u)}
                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Edit Satuan"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUnit(u)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Hapus Satuan"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: KATEGORI MENU & BAHAN                                              */}
      {/* ========================================================================= */}
      {activeTabSub === 'categories' && (
        <div className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase mb-1">Total Kategori</div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">{categories.length} Kategori</div>
              <p className="text-[11px] text-slate-400 mt-1">Kategori produk dan bahan baku</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase mb-1">Kategori Produk Menu</div>
              <div className="text-2xl font-extrabold text-emerald-600 font-mono">
                {categories.filter(c => c.type === 'product' || !c.type).length} Kategori
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Tampil di menu katalog kasir POS</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase mb-1">Kategori Bahan Baku</div>
              <div className="text-2xl font-extrabold text-blue-600 font-mono">
                {categories.filter(c => c.type === 'ingredient').length} Kategori
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Pengelompokan inventori gudang</p>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama kategori..."
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={catFilterType}
                onChange={(e) => setCatFilterType(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Semua Tipe Kategori</option>
                <option value="product">Produk Menu Kasir</option>
                <option value="ingredient">Bahan Baku Gudang</option>
                <option value="general">Umum / Keduanya</option>
              </select>

              <button
                type="button"
                onClick={handleOpenAddCat}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Kategori Baru</span>
              </button>
            </div>
          </div>

          {/* Categories Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Nama Kategori</th>
                    <th className="px-4 py-3">Tipe Kategori</th>
                    <th className="px-4 py-3">Slug / Kode</th>
                    <th className="px-4 py-3">Deskripsi Keterangan</th>
                    <th className="px-4 py-3 text-center">Penggunaan</th>
                    <th className="px-4 py-3 text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        Tidak ada kategori yang sesuai dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((c) => {
                      const countProds = products.filter(p => p.categoryId === c.id || p.categoryName === c.name).length;
                      const countIngs = ingredients.filter(i => i.category === c.name).length;
                      const typeLabel = c.type === 'ingredient' ? 'Bahan Baku' : c.type === 'general' ? 'Umum / Keduanya' : 'Produk Menu';

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-extrabold text-slate-900">
                            {c.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.type === 'ingredient' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                              c.type === 'general' ? 'bg-purple-50 text-purple-800 border border-purple-200' :
                              'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}>
                              {typeLabel}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-500">
                            {c.slug}
                          </td>
                          <td className="px-4 py-3 text-slate-500 max-w-sm truncate">
                            {c.description || '-'}
                          </td>
                          <td className="px-4 py-3 text-center font-mono whitespace-nowrap">
                            {c.type === 'ingredient' ? (
                              <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                {countIngs} Bahan
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                {countProds} Produk
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditCat(c)}
                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Edit Kategori"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCat(c)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Hapus Kategori"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PROFIL USAHA & PAJAK                                               */}
      {/* ========================================================================= */}
      {activeTabSub === 'profile' && (
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Store Profile */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5 text-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Store className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Profil Usaha / Toko</h3>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Toko / Brand:</label>
                <input
                  type="text"
                  value={formSettings.storeName}
                  onChange={(e) => handleChange('storeName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tagline / Slogan Toko:</label>
                <input
                  type="text"
                  value={formSettings.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Lengkap Outlet:</label>
                <textarea
                  rows={2}
                  value={formSettings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">No. WhatsApp / Kontak Toko:</label>
                <input
                  type="text"
                  value={formSettings.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Estimasi Biaya Tetap Bulanan (Rp) untuk Simulasi BEP:
                </label>
                <input
                  type="number"
                  min="0"
                  step="500000"
                  value={formSettings.fixedMonthlyOverhead}
                  onChange={(e) => handleChange('fixedMonthlyOverhead', Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs font-mono font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Biaya sewa, gaji pokok karyawan, wifi & listrik per bulan
                </span>
              </div>
            </div>

            {/* Pajak & Service Charge */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5 text-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Percent className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Pajak Resto (PB1) & Service Charge</h3>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Aktifkan Pajak PB1 / Resto</div>
                    <div className="text-[11px] text-slate-500">Dikenakan otomatis pada pesanan kasir</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formSettings.enableTax}
                    onChange={(e) => handleChange('enableTax', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                </div>

                {formSettings.enableTax && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Persentase Pajak (%):</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={formSettings.taxPercent}
                      onChange={(e) => handleChange('taxPercent', Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                    />
                  </div>
                )}
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Aktifkan Biaya Layanan (Service Charge)</div>
                    <div className="text-[11px] text-slate-500">Service charge untuk dine-in / operasional</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formSettings.enableServiceCharge}
                    onChange={(e) => handleChange('enableServiceCharge', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                </div>

                {formSettings.enableServiceCharge && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Persentase Service (%):</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={formSettings.serviceChargePercent}
                      onChange={(e) => handleChange('serviceChargePercent', Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Simpan Perubahan Profil & Pajak
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PRINTER & STRUK                                                    */}
      {/* ========================================================================= */}
      {activeTabSub === 'printer' && (
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs max-w-2xl">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Printer className="w-4 h-4 text-emerald-600" />
              <h3 className="font-extrabold text-slate-900 text-sm">Konfigurasi Printer Thermal & Format Struk</h3>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Format Lebar Kertas Thermal:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleChange('receiptPaperSize', '58mm')}
                  className={`py-3 px-4 rounded-xl border text-center transition-all ${
                    formSettings.receiptPaperSize === '58mm'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-sm font-extrabold">58 mm</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Printer Mini / Bluetooth Portabel</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('receiptPaperSize', '80mm')}
                  className={`py-3 px-4 rounded-xl border text-center transition-all ${
                    formSettings.receiptPaperSize === '80mm'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-sm font-extrabold">80 mm</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Printer Desktop Standar Resto / Kasir</div>
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formSettings.autoPrintReceipt}
                  onChange={(e) => handleChange('autoPrintReceipt', e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <div>
                  <div className="font-bold text-slate-900">Buka Dialog Cetak Otomatis</div>
                  <div className="text-[11px] text-slate-500">Langsung memunculkan cetak struk setelah kasir menyelesaikan transaksi</div>
                </div>
              </label>

              <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formSettings.printKitchenTicket}
                  onChange={(e) => handleChange('printKitchenTicket', e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <div>
                  <div className="font-bold text-slate-900">Cetak Tiket Pesanan Dapur / Kitchen Ticket</div>
                  <div className="text-[11px] text-slate-500">Cetak salinan khusus untuk barista & tim kitchen tanpa rincian harga</div>
                </div>
              </label>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Catatan Footer / Kaki Struk:</label>
              <textarea
                rows={3}
                value={formSettings.receiptFooterMessage}
                onChange={(e) => handleChange('receiptFooterMessage', e.target.value)}
                placeholder="Terima kasih atas kunjungan Anda..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs font-mono"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Simpan Setelan Printer
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: BACKUP & RESTORE DATABASE                                          */}
      {/* ========================================================================= */}
      {activeTabSub === 'database' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs max-w-2xl">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Database className="w-4 h-4 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">Cadangkan & Pulihkan Database (Backup & Restore)</h3>
          </div>

          <p className="text-slate-600 leading-relaxed">
            Seluruh data master produk, bahan baku, jenis satuan, kategori, formula resep HPP, mutasi stok, dan riwayat transaksi tersimpan secara aman di penyimpanan browser lokal (localStorage). Ekspor berkala untuk cadangan arsip Anda.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span>Download Cadangan JSON</span>
            </button>

            <label className="flex-1 py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-300 text-center shadow-2xs">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Pulihkan dari File JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-xl space-y-2">
              <div className="font-bold text-red-950 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Reset Database ke Setelan Pabrik</span>
              </div>
              <p className="text-[11px] text-red-800">
                Tindakan ini akan mengembalikan seluruh produk, bahan baku, satuan, kategori, dan transaksi ke setelan awal sistem. Tindakan ini tidak dapat dibatalkan.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (confirm('PERINGATAN RESMI: Apakah Anda benar-benar yakin ingin mereset seluruh database aplikasi kembali ke setelan bawaan awal pabrik?')) {
                    resetAllData();
                    alert('Data berhasil direset ke setelan awal pabrik.');
                  }
                }}
                className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ke Data Bawaan Awal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH / EDIT JENIS SATUAN                                         */}
      {/* ========================================================================= */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 border border-slate-200 relative my-auto animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  {editingUnit ? 'Edit Jenis Satuan' : 'Tambah Jenis Satuan Baru'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Satuan takaran bahan baku, resep, atau stok
                </p>
              </div>
              <button
                onClick={() => setIsUnitModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUnit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kode Satuan <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: gr, ml, cup"
                    value={unitCode}
                    onChange={(e) => setUnitCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Simbol singkat</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kategori Takaran <span className="text-red-500">*</span>:
                  </label>
                  <select
                    value={unitCategory}
                    onChange={(e) => setUnitCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white font-semibold text-slate-800"
                  >
                    <option value="Berat / Massa">Berat / Massa</option>
                    <option value="Volume / Cairan">Volume / Cairan</option>
                    <option value="Jumlah / Satuan">Jumlah / Satuan</option>
                    <option value="Kemasan">Kemasan</option>
                    <option value="Takaran Dapur">Takaran Dapur</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Lengkap Satuan <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Gram, Mililiter, Cup Gelas, Botol"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Keterangan / Contoh Penggunaan (Opsional):
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Takaran bubuk kopi, susu kental manis, sirup..."
                  value={unitDesc}
                  onChange={(e) => setUnitDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUnitModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition-all"
                >
                  {editingUnit ? 'Simpan Perubahan' : 'Tambah Satuan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH / EDIT KATEGORI                                             */}
      {/* ========================================================================= */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 border border-slate-200 relative my-auto animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  {editingCat ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Pengelompokan menu kasir atau bahan baku gudang
                </p>
              </div>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCat} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Kategori <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kopi & Minuman, Bahan Dairy, Kemasan"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tipe Penggunaan Kategori <span className="text-red-500">*</span>:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCatType('product')}
                    className={`p-2 rounded-xl border text-center font-bold transition-all ${
                      catType === 'product'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-[11px]">Produk Menu</div>
                    <div className="text-[9px] text-slate-400 font-normal">Kasir POS</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCatType('ingredient')}
                    className={`p-2 rounded-xl border text-center font-bold transition-all ${
                      catType === 'ingredient'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-[11px]">Bahan Baku</div>
                    <div className="text-[9px] text-slate-400 font-normal">Resep / Gudang</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCatType('general')}
                    className={`p-2 rounded-xl border text-center font-bold transition-all ${
                      catType === 'general'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-[11px]">Umum</div>
                    <div className="text-[9px] text-slate-400 font-normal">Keduanya</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Keterangan / Deskripsi (Opsional):
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Menu minuman kopi panas & dingin..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition-all"
                >
                  {editingCat ? 'Simpan Perubahan' : 'Buat Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
