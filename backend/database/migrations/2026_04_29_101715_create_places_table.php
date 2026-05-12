<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('places', function (Blueprint $table) {
            $table->id();

            $table->foreignId('category_id')->constrained()->onDelete('cascade');

            $table->string('document_id', 255)->unique();
            $table->string('name', 255);
            $table->string('email', 255)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('website', 255)->nullable();
            $table->string('area', 150)->nullable();
            $table->text('address')->nullable();
            $table->decimal('lat', 10, 6)->nullable();
            $table->decimal('lon', 10, 6)->nullable();
            $table->text('summary')->nullable();
            $table->longText('description')->nullable();
            $table->boolean('tags_generated')->default(false);
            $table->boolean('translated')->default(false);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('places');
    }
};
