import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { AppHeader } from '@/components/app-header';
import InputError from '@/components/input-error';
import SalesLayout from '@/layouts/sales-layout';

export default function SalesProfileCreate() {
    const { data, setData, post, processing, errors } = useForm({
        phone: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('sales.profile.store'));
    };

    return (
        <SalesLayout>
            <Head title="Buat Profile Sales" />

            <div className="p-4 pb-20">
                <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="mb-6">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                            <span className="text-2xl">👤</span>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 text-center mb-2">
                            Lengkapi Profile Sales
                        </h2>
                        <p className="text-sm text-gray-600 text-center">
                            Isi data berikut untuk membuat profile sales Anda
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                Nomor Telepon
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Contoh: 081234567890"
                                required
                            />
                            <InputError message={errors.phone} className="mt-1" />
                        </div>

                        <div className="text-xs text-gray-500">
                            <p>Pastikan nomor telepon aktif untuk komunikasi dengan tim</p>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Menyimpan...' : 'Buat Profile'}
                        </button>
                    </form>
                </div>
            </div>
        </SalesLayout>
    );
}
