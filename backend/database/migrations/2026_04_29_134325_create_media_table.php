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
        Schema::create('media', function (Blueprint $table) {
            $table->id();

            $table->foreignId('place_id')->constrained()->onDelete('cascade');

            $table->enum('type', ['image', 'video'])->default('image');
            $table->string('ext', 10)->nullable();
            $table->string('mime', 50)->nullable();
            $table->text('original_url');
            $table->text('app_url')->nullable();
            $table->integer('position');
            $table->enum('storage_status', ['pending', 'processing', 'done', 'failed'])->default('pending');
            $table->timestamps();

            $table->unique(['place_id', 'original_url'], 'unique_place_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
