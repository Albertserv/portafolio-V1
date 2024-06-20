require "test_helper"

class ProyectosControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get proyectos_index_url
    assert_response :success
  end

  test "should get show" do
    get proyectos_show_url
    assert_response :success
  end

  test "should get new" do
    get proyectos_new_url
    assert_response :success
  end

  test "should get create" do
    get proyectos_create_url
    assert_response :success
  end

  test "should get edit" do
    get proyectos_edit_url
    assert_response :success
  end

  test "should get update" do
    get proyectos_update_url
    assert_response :success
  end

  test "should get destroy" do
    get proyectos_destroy_url
    assert_response :success
  end
end
